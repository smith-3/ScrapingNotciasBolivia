import { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer';
import { filterParagraphsPro } from '../../assets/conectores';
import { NoticiaData } from '@/components/Card';

const URL_BASE = 'https://www.lostiempos.com/actualidad?page=';
const startPage = 0;


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { endPage } = req.query;

    if (typeof endPage !== 'string') {
        res.status(400).json({ error: 'Missing endPage parameter' });
        return;
    }

    const browser = await puppeteer.launch();
    const endPageNumber = parseInt(endPage, 10);


    try {
        if (isNaN(endPageNumber)) {
            res.status(400).json({ error: 'Invalid endPage parameter' });
            return;
        }

        const scrapedData: NoticiaData[] = [];

        for (let i = startPage; i <= endPageNumber; i++) {
            const URL_FINAL = `${URL_BASE}${i}`;
            try {
                const page = await browser.newPage();
                await page.goto(URL_FINAL, { timeout: 60000 });
                await page.waitForSelector('[class^="views-row views-row-"]', { timeout: 60000 });

                const items = await page.evaluate(() => {
                    const elements = document.querySelectorAll('[class^="views-row views-row-"]');
                    return Array.from(elements).map(element => {
                        const titleElement = element.querySelector('.views-field-title a') as HTMLElement;
                        const linkElement = element.querySelector('.views-field-title a') as HTMLAnchorElement;
                        const dateElement = element.querySelector('.views-field-field-noticia-fecha .date-display-single') as HTMLElement;

                        const title = titleElement?.innerText?.trim() || '';
                        const link = linkElement?.href || '';
                        const date = dateElement?.innerText?.trim() || '';
                        const page = 'Los Tiempos';

                        return { title, link, date, page };
                    });
                });

                for (const item of items) {
                    try {
                        await page.goto(item.link, { timeout: 60000 });
                        await page.waitForSelector('.field-item.even p', { timeout: 60000 });

                        const paragraphs = await page.evaluate(() => {
                            const pElements = document.querySelectorAll('.field-item.even p');
                            return Array.from(pElements).map(p => p.innerHTML);
                        });

                        const linkImage = await page.$eval('li.active-slide img.image-style-noticia-detalle', (img: HTMLImageElement) => img.src);

                        // Convertir la fecha al formato YYYY-MM-DD
                        const dateParts = item.date.split('/');
                        const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

                        // Filtrar palabras vacías y unir los párrafos
                        const filteredParagraphs = filterParagraphsPro(paragraphs);
                        const titleFilter = filterParagraphsPro(item.title);

                        const scrapedItem: NoticiaData = {
                            title: item.title,
                            date: formattedDate,
                            content: paragraphs.join(' '),
                            link: item.link,
                            page: item.page,
                            linkImage: linkImage,
                            contentFilter: `${titleFilter} ${filteredParagraphs}`
                        };
                        scrapedData.push(scrapedItem);
                    } catch (error) {
                        console.error(`Error fetching item details for link ${item.link}:`, error);
                    }
                }

                await page.close();

            } catch (error) {
                console.error(`Error navigating to page ${i}:`, error);
            }
        }
        res.status(200).json(scrapedData);

    } catch (error) {
        console.error('Error during scraping:', error);
        res.status(500).json({ error: 'Failed to scrape data' });

    } finally {
        await browser.close();
    }
}
