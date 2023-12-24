// src/pages/api/views/[username].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';

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
        // Connect to MongoDB
        const { db } = await connectToDatabase();

        // Find the user's count
        const collection = db.collection('views');
        const result = await collection.findOne({ username });
        const userCount = result ? result.count : 0;

        if (!userCount) {
            // If the user is not found, create a new entry
            await collection.insertOne({ username, count: 1 });
        } else {
            // If the user exists, update the count and return the updated count
            await collection.updateOne({ username }, { $inc: { count: 1 } });
        }

        // Get the updated count after insert/update
        const updatedResult = await collection.findOne({ username });
        const updatedUserCount = updatedResult ? updatedResult.count : 0;

        const badgeSVG = getBadgeSVG({
            views: updatedUserCount,
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
