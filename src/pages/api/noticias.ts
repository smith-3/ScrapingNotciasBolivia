import { NextApiRequest, NextApiResponse } from 'next';
import { createConnection, getNoticiasBetweenDates, insertNoticia } from '../../lib/db';
import { NoticiaData } from '@/components/Card';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const noticia: NoticiaData = req.body;

        if (!noticia.title || !noticia.date || !noticia.content || !noticia.link || !noticia.page) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        const connection = await createConnection();

        try {
            await insertNoticia(connection, noticia);
            res.status(200).json({ message: 'Noticia added successfully' });

        } catch (error) {
            console.error('Error inserting noticia:', error);
            res.status(500).json({ error: 'Failed to add noticia' });

        } finally {
            await connection.end();
        }
    } else if (req.method === 'GET') {
        const { dateInicio, dateFin } = req.query;

        if (!dateInicio || !dateFin) {
            res.status(400).json({ error: 'Missing required query parameters' });
            return;
        }

        const connection = await createConnection();

        try {
            const noticias = await getNoticiasBetweenDates(connection, dateInicio as string, dateFin as string);
            res.status(200).json(noticias);

        } catch (error) {
            console.error('Error fetching noticias:', error);
            res.status(500).json({ error: 'Failed to fetch noticias' });

        } finally {
            await connection.end();
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}