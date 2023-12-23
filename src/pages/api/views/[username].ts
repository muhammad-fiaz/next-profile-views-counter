// src/pages/api/views/[username].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getDatabase } from '@/lib/postgres';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { username, color, label, style, diagonalSize, theme, template, backgroundColor } = req.query as {
        username: string;
        color?: string;
        label?: string;
        style?: string;
        diagonalSize?: string;
        theme?: string;
        template?: string;
        backgroundColor?: string;
    };

    try {
        // Get the PostgreSQL database instance
        const pool = await getDatabase();

        // Find the user's count
        const result = await pool.query('SELECT count FROM views WHERE username = $1', [username]);
        const userCount = result.rows[0];

        if (!userCount) {
            // If the user is not found, create a new entry
            await pool.query('INSERT INTO views (username, count) VALUES ($1, 1) ON CONFLICT (username) DO NOTHING', [username]);
        } else {
            // If the user exists, update the count and return the updated count
            await pool.query('UPDATE views SET count = count + 1 WHERE username = $1', [username]);
        }

        // Get the updated count after insert/update
        const updatedResult = await pool.query('SELECT count FROM views WHERE username = $1', [username]);
        const updatedUserCount = updatedResult.rows[0];

        const badgeSVG = getBadgeSVG({
            views: updatedUserCount ? updatedUserCount.count : 0,
            color,
            label,
            style,
            diagonalSize,
            theme,
            template,
            backgroundColor,
        });

        res.setHeader('Content-Type', 'image/svg+xml');
        res.status(200).send(badgeSVG);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

function getBadgeSVG({
                         views,
                         color = '#808080',
                         label = 'Views',
                         style = '',
                         diagonalSize = '120',
                         theme = 'light',
                         template = 'default',
                         backgroundColor = '#ffffff', // Default background color is white
                     }: BadgeOptions): string {
    const width = Math.sqrt((parseInt(diagonalSize) ** 2) / 2);
    const height = width / 2;

    const themeColor = theme === 'dark' ? '#000000' : '#ffffff';
    const textColor = theme === 'dark' ? '#ffffff' : '#000000';

    let templateStyles = '';

    if (template === 'rounded') {
        templateStyles = `rect { rx: 10; }`;
    }

    return `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
            <style>
                /* Add your custom CSS styles here */
                text {
                    ${style}
                    fill: ${textColor};
                }
                rect {
                    fill: ${backgroundColor};
                    ${templateStyles}
                }
            </style>
            <rect width="${width}" height="${height}" rx="3"/>
            <text x="${width / 2}" y="${height / 2 + 4}" text-anchor="middle" fill="${themeColor}">
                ${label}: ${views}
            </text>
        </svg>
    `;
}

interface BadgeOptions {
    views: number;
    color?: string;
    label?: string;
    style?: string;
    diagonalSize?: string;
    theme?: string;
    template?: string;
    backgroundColor?: string;
}
