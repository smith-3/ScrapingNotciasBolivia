import { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer';
import { filterParagraphsPro } from '../../assets/conectores';
import { NoticiaData } from '@/components/Card';

const URL_BASE = 'https://eldeber.com.bo/pais';

const monthNames: { [key: string]: string } = {
    'enero': '01',
    'febrero': '02',
    'marzo': '03',
    'abril': '04',
    'mayo': '05',
    'junio': '06',
    'julio': '07',
    'agosto': '08',
    'septiembre': '09',
    'octubre': '10',
    'noviembre': '11',
    'diciembre': '12'
};

const timeout = (millisecond: number) => {
    return new Promise(resolve => {
        setTimeout(resolve, millisecond);
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

    const browser = await puppeteer.launch();

    try {
        const scrapedData: NoticiaData[] = [];
        const page = await browser.newPage();
        await page.goto(URL_BASE, { timeout: 90000 });
        for (let j = 0; j < endPageNumber; j++) {
            // Espera explícita para asegurarse de que el botón esté disponible
            await page.waitForSelector('.sector.sector-view-more .btn-view-more.get-more-search-keywords', { visible: true });
            await page.click('.sector.sector-view-more .btn-view-more.get-more-search-keywords');
            // Espera después de hacer clic para permitir que las noticias se carguen
            await timeout(3000);;
        }

        const items = await page.evaluate(() => {
            const elements = document.querySelectorAll('.jsx-742874305.nota.linked');
            return Array.from(elements).map(element => {
                const title = (element.querySelector('.jsx-742874305.text h2') || {}).innerHTML || '';
                const linkElement = (element.querySelector('.jsx-742874305.nota-link') as HTMLAnchorElement);
                const link = linkElement?.href || '';
                const page = 'El Deber';
                return { title, link, page };
            });
        });

        for (const item of items) {
            try {
                await page.goto(item.link, { timeout: 90000, waitUntil: 'load' });
                await page.waitForSelector('[class="text-editor"]');

                const paragraphs = await page.evaluate(() => {
                    const pElements = document.querySelectorAll('.text-editor p');
                    return Array.from(pElements).map(p => p.innerHTML);
                });

                const linkImage = await page.$eval('figure.slide.slide-image img', (img: HTMLImageElement) => img.src);

                const date = await page.evaluate(() => {
                    const dateElement = document.querySelector('.dateNote');
                    return dateElement ? dateElement.innerHTML : '';
                });

                let formattedDate = new Date().toISOString().slice(0, 10);
                if (date) {
                    const [day, monthName, year] = date.replace(/(,|de )/g, '').split(' ');
                    const month = monthNames[monthName.toLowerCase()];

                    if (day && month && year) {
                        formattedDate = `${year}-${month}-${day.padStart(2, '0')}`;
                    } else {
                        console.error('Formato de fecha no válido:', date);
                    }
                } else {
                    console.error('No se pudo encontrar la fecha en la página.');
                }

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
        res.status(200).json(scrapedData);
    } catch (error) {
        console.error('Error during scraping:', error);
        res.status(500).json({ error: 'Failed to scrape data' });
    } finally {

        await browser.close();
    }
}
