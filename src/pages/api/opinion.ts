import { NextApiRequest, NextApiResponse } from 'next';
import puppeteer, { Page } from 'puppeteer';
import { filterParagraphsPro } from '../../assets/conectores';
import { NoticiaData } from '@/components/Card';

const URL_BASE = 'https://www.opinion.com.bo/blog/section/pais/?page=';
const startPage = 1;

const monthNames: { [key: string]: string } = {
    'enero': '01', 'febrero': '02', 'marzo': '03', 'abril': '04', 'mayo': '05', 'junio': '06',
    'julio': '07', 'agosto': '08', 'septiembre': '09', 'octubre': '10', 'noviembre': '11', 'diciembre': '12'
};

function parseDate(dateString: string): string | null {
    const parts = dateString.match(/(\d{1,2}) de (\w+) de (\d{4})/);
    if (!parts) return null;
    const day = parts[1].padStart(2, '0');
    const monthName = parts[2].toLowerCase();
    const year = parts[3];
    const month = monthNames[monthName];
    if (!month) return null;
    return `${year}-${month}-${day}`;
}

async function autoScroll(page: Page) {
    await page.evaluate(async () => {
        await new Promise<void>((resolve, reject) => {
            let totalHeight = 0;
            const distance = 1000; // Aumentamos la velocidad del scroll
            const scrollHeight = document.documentElement.scrollHeight;
            const timer = setInterval(() => {
                window.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 1);
        });
    });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { endPage } = req.query;
    if (typeof endPage !== 'string') {
        res.status(400).json({ error: 'Missing endPage parameter' });
        return;
    }
    const endPageNumber = parseInt(endPage, 10);
    if (isNaN(endPageNumber)) {
        res.status(400).json({ error: 'Invalid endPage parameter' });
        return;
    }
    const browser = await puppeteer.launch({
        headless: false, // Set to true in production
        defaultViewport: null,
        slowMo: 1000, // Remove in production
    });
    const page = await browser.newPage();

    try {
        const scrapedData: NoticiaData[] = [];
        for (let i = startPage; i <= endPageNumber; i++) {
            const URL_FINAL = `${URL_BASE}${i}`;
            try {
                console.log(`Navigating to page ${i}`);
                await page.goto(URL_FINAL, { timeout: 60000 });
                await autoScroll(page);
                await page.waitForSelector('.col-md-8.col-sm-7.section-list');
                const items = await page.evaluate(() => {
                    const articleNodes = document.querySelectorAll('.onm-new.content.image-top-left');
                    return Array.from(articleNodes).map(article => {
                        const titleNode = article.querySelector('h2.title-article a');
                        const linkNode = titleNode as HTMLAnchorElement;
                        return {
                            title: titleNode ? titleNode.innerHTML.trim() : '',
                            link: linkNode ? linkNode.href : ''
                        };
                    });
                });
                for (const item of items) {
                    if (!item.link) {
                        console.error(`No link found for item: ${item.title}`);
                        continue;
                    }
                    try {
                        await page.goto(item.link, { timeout: 90000 });
                        await autoScroll(page);
                        let linkImage = '';
                        try {
                            linkImage = await page.$eval('.article-media figure a img', (img: HTMLImageElement) => img.src);
                        } catch (e) {
                            console.error('Error extracting linkImage:', e);
                        }
                        await page.waitForSelector('.body.pais');
                        const result = await page.evaluate(() => {
                            const dateElement = document.querySelector('.content-time');
                            const paragraphs = document.querySelectorAll('.body.pais p');
                            const date = dateElement?.textContent?.trim() || '';
                            const content = Array.from(paragraphs).map(p => p.textContent?.trim() || '').join(' ');

                            return { date, content };
                        });
                        const formattedDate = parseDate(result.date);
                        if (!formattedDate) {
                            console.error(`Invalid date format: ${result.date}`);
                            continue;
                        }
                        // Extract linkImage

                        // Filter paragraphs
                        const filteredParagraphs = filterParagraphsPro(result.content);
                        // Filter title
                        const titleFilter = filterParagraphsPro(item.title);
                        const scrapedItem: NoticiaData = {
                            title: item.title,
                            date: formattedDate,
                            content: result.content,
                            link: item.link,
                            page: 'Opinión',
                            linkImage: linkImage, // Add logic to extract image if necessary
                            contentFilter: `${titleFilter} ${filteredParagraphs}`
                        };
                        scrapedData.push(scrapedItem);
                    } catch (innerError) {
                        console.error(`Error navigating to page ${item.link}:`, innerError);
                    }
                }
            } catch (error) {
                console.error(`Error navigating to page ${i}:`, error);
            }
        }
        res.status(200).json(scrapedData);
    } catch (error) {
        console.error('Error during scraping:', error);
        res.status(500).json({ error: 'Failed to scrape data' });
    } finally {
        await page.close();
        await browser.close();
    }
}
