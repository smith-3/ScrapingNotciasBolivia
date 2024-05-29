"use client";

// Importa ScrapedData y otros elementos de MUI
import React, { useState } from 'react';
import { Container, TextField, Button, Toolbar, Typography, CircularProgress, Box, Paper, Grid } from '@mui/material';
import Link from 'next/link';
import Noticia, { NoticiaData } from '@/components/Card';


export default function Scraping() {
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingT, setIsLoadingT] = useState(false);
    const [isLoadingD, setIsLoadingD] = useState(false);
    const [isLoadingO, setIsLoadingO] = useState(false);

    const [data, setData] = useState<NoticiaData[]>([]);
    const [totalPages, setTotalPages] = useState<number | string>(1);

    const handleDeleteNews = async (link: string) => {
        try {
            // Eliminar la noticia del estado data sin modificar la base de datos
            const updatedData = data.filter(item => item.link !== link);
            setData(updatedData);
        } catch (error) {
            console.error('Error al eliminar la noticia:', error);
        }
    };

    const handleRequestAll = async () => {
        setIsLoading(true);
        try {
            const [tiemposResult, deberResult, opinionResult] = await Promise.all([
                fetch(`/api/scrape?endPage=${totalPages}`),
                fetch(`/api/deber?endPage=${totalPages}`),
                fetch(`/api/opinion?endPage=${totalPages}`)
            ]);

            if (!tiemposResult.ok || !deberResult.ok || !opinionResult.ok) {
                throw new Error('Network response was not ok');
            }

            const tiemposData = await tiemposResult.json();
            const deberData = await deberResult.json();
            const opinionData = await opinionResult.json();

            const listaUnida: NoticiaData[] = tiemposData.concat(deberData, opinionData);


            // Establezca el estado con el objeto combinado
            setData(listaUnida ? listaUnida : []);
        } catch (error) {
            console.error('Error al realizar scraping:', error);
        }
        setIsLoading(false);
    };


    const handleRequestTiempos = async () => {
        setIsLoadingT(true);
        try {
            const response = await fetch(`/api/scrape?endPage=${totalPages}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const result = await response.json();
            setData(result);
        } catch (error) {
            console.error('Error al realizar scraping:', error);
        }
        setIsLoadingT(false);
    };

    const handleRequestDeber = async () => {
        setIsLoadingD(true);
        try {
            const response = await fetch(`/api/deber?endPage=${totalPages}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const result = await response.json();
            setData(result);
        } catch (error) {
            console.error('Error al realizar scraping:', error);
        }
        setIsLoadingD(false);
    };

    const handleRequestOpinion = async () => {
        setIsLoadingO(true);
        try {
            const response = await fetch(`/api/opinion?endPage=${totalPages}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const result = await response.json();
            setData(result);
        } catch (error) {
            console.error('Error al realizar scraping:', error);
        }
        setIsLoadingO(false);
    };

    const handleTotalPagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTotalPages(event.target.value);
    };

    const handleAnalyzeData = async () => {
        try {
            for (const item of data) {
                const response = await fetch('/api/noticias', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(item),
                });

                if (!response.ok) {
                    throw new Error('Error al enviar la noticia a la base de datos');
                }
            }
        } catch (error) {
            console.error('Error al analizar datos:', error);
            alert('Hubo un error al enviar los datos a la base de datos');
        }
    };


    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <Container maxWidth="lg">
                <Paper
                    elevation={3}
                    sx={{ mt: 4, borderRadius: 2, padding: 2, backgroundColor: 'white' }}
                >
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: '#333' }}>
                            Scraping
                        </Typography>
                        <TextField
                            label="Total de páginas a visitar"
                            type="number"
                            value={totalPages}
                            onChange={handleTotalPagesChange}
                            variant="outlined"
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            sx={{ mr: 2, width: 200 }}
                        />
                        <Button
                            onClick={() => handleRequestAll()}
                            disabled={isLoading}
                            variant="contained"
                            sx={{
                                bgcolor: isLoading ? 'gray' : 'black',
                                color: 'white',
                                '&:hover': {
                                    bgcolor: 'white',
                                    color: 'black'
                                }
                            }}
                        >
                            {isLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Todas las Paginas'}
                        </Button>
                        <Button
                            onClick={() => handleRequestTiempos()}
                            disabled={isLoadingT}
                            variant="contained"
                            sx={{
                                bgcolor: isLoadingT ? 'gray' : '#CBB500',
                                color: 'white',
                                '&:hover': {
                                    bgcolor: 'white',
                                    color: 'black'
                                },
                                ml: 2
                            }}
                        >
                            {isLoadingT ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Los Tiempos'}
                        </Button>
                        <Button
                            onClick={() => handleRequestDeber()}
                            disabled={isLoadingD}
                            variant="contained"
                            sx={{
                                bgcolor: isLoadingD ? 'gray' : 'green',
                                color: 'white',
                                '&:hover': {
                                    bgcolor: 'white',
                                    color: 'black'
                                },
                                ml: 2
                            }}
                        >
                            {isLoadingD ? <CircularProgress size={24} sx={{ color: 'black' }} /> : 'El Deber'}
                        </Button>
                        <Button
                            onClick={() => handleRequestOpinion()}
                            disabled={isLoadingO}
                            variant="contained"
                            sx={{
                                bgcolor: isLoadingO ? 'gray' : 'blue',
                                color: 'white',
                                '&:hover': {
                                    bgcolor: 'white',
                                    color: 'black'
                                },
                                ml: 2
                            }}
                        >
                            {isLoadingO ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Opinion'}
                        </Button>

                    </Toolbar>
                </Paper>
                {data.length > 0 && (
                    <Box
                        sx={{
                            position: 'fixed',
                            bottom: '1rem',
                            right: '1rem',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '1rem',
                        }}
                    >

                        <Link href="/" passHref>
                            <Button
                                onClick={handleAnalyzeData}
                                variant="contained"
                                sx={{ bgcolor: 'black' }}
                            >
                                Analizar Datos
                            </Button>
                        </Link>
                    </Box>
                )}
                <Box sx={{ mt: 4 }}>
                    {data.length > 0 && (
                        <Grid container spacing={3}>
                            {data.map((item, index) => (
                                <Grid item xs={12} sm={6} md={4} key={index}>
                                    <Noticia
                                        title={item.title}
                                        date={item.date}
                                        link={item.link}
                                        content={item.content}
                                        page={item.page}
                                        linkImage={item.linkImage}
                                        handleDeleteNews={handleDeleteNews}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>
            </Container>
        </div>
    );
}
