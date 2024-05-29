import { NoticiaData } from '@/components/Card';
import mysql from 'mysql2/promise';

export async function createConnection() {
    return mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '123456',
        database: 'BigData'
    });
}

export async function insertNoticia(connection: mysql.Connection, noticia: NoticiaData) {
    const { title, date, content, link, page, linkImage, contentFilter } = noticia;
    // Realizar la inserción si no existe una noticia con el mismo link
    const query = `
        INSERT INTO noticias (id, title, date, content, link, page, linkImage, contentFilter)
        SELECT ?, ?, ?, ?, ?, ?, ?, ?
        WHERE NOT EXISTS (
            SELECT 1 FROM noticias WHERE link = ?
        )
    `;
    // Ejecutar la consulta
    await connection.query(query, [link, title, date, content, link, page, linkImage, contentFilter, link]);
}


// Función para obtener noticias entre dos fechas
export async function getNoticiasBetweenDates(connection: mysql.Connection, dateInicio: string, dateFin: string) {
    const [rows] = await connection.query(
        'SELECT * FROM noticias WHERE date BETWEEN ? AND ?',
        [dateInicio, dateFin]
    );
    return rows;
}
