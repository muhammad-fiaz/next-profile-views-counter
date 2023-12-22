// src/pages/api/views/[username].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getDatabase } from '@/lib/sqlite';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { username, color, label, style, diagonalSize } = req.query as {
        username: string;
        color?: string;
        label?: string;
        style?: string;
        diagonalSize?: string;
    };

    try {
        // Get the SQLite database instance
        const db = await getDatabase();

        // Find the user's count
        const userCount = await db.get<{ count: number }>('SELECT count FROM views WHERE username = ?', username);

        if (!userCount) {
            // If the user is not found, create a new entry
            await db.run('INSERT INTO views (username, count) VALUES (?, 1)', username);
            const badgeSVG = getBadgeSVG({ views: 1, color, label, style, diagonalSize });
            res.setHeader('Content-Type', 'image/svg+xml');
            res.status(200).send(badgeSVG);
        } else {
            // If the user exists, update the count and return the updated count
            const updatedCount = userCount.count + 1;
            await db.run('UPDATE views SET count = count + 1 WHERE username = ?', username);
            const badgeSVG = getBadgeSVG({ views: updatedCount, color, label, style, diagonalSize });
            res.setHeader('Content-Type', 'image/svg+xml');
            res.status(200).send(badgeSVG);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

function getBadgeSVG({ views, color = '#808080', label = 'Views', style = '', diagonalSize = '120' }: BadgeOptions): string {
    const width = Math.sqrt((parseInt(diagonalSize) ** 2) / 2);
    const height = width / 2;
    return `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
            <style>
                /* Add your custom CSS styles here */
                text {
                    ${style}
                }
                rect {
                    fill: ${color};
                }
            </style>
            <rect width="${width}" height="${height}" rx="3"/>
            <text x="${width / 2}" y="${height / 2 + 4}" text-anchor="middle" fill="#ffffff">
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
}
