import { type NextApiRequest, type NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'
import csvtojson from 'csvtojson'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Content-Type', 'application/json');

    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({
            error: 'Method not allowed',
            title: 'Breaking: Technical Difficulties at AI News Network',
            description: 'Our AI anchors are experiencing temporary issues.'
        });
    }

    try {
        const csvPath = path.join(process.cwd(), 'public', 'news_database.csv')

        if (!fs.existsSync(csvPath)) {
            return res.status(404).json({
                error: 'News database file not found',
                title: 'Breaking: Technical Difficulties at AI News Network',
                description: 'Our AI anchors are experiencing temporary issues.'
            });
        }

        const csvText = fs.readFileSync(csvPath, 'utf-8')
        const news = await csvtojson({
            noheader: true,
            headers: ['title', 'description']
        }).fromString(csvText)

        if (!news || news.length === 0) {
            return res.status(200).json({
                title: 'Breaking: Technical Difficulties at AI News Network',
                description: 'Our AI anchors are experiencing temporary issues.'
            });
        }

        const randomNews = news[Math.floor(Math.random() * news.length)]

        return res.status(200).json({
            title: randomNews.title.replace(/^"|"$/g, ''),
            description: randomNews.description.replace(/^"|"$/g, '')
        });
    } catch (error) {
        console.error('Error in news API:', error);
        return res.status(500).json({
            error: 'Internal server error',
            title: 'Breaking: Technical Difficulties at AI News Network',
            description: 'Our AI anchors are experiencing temporary issues.'
        });
    }
} 