"use client";
import React, { useEffect, useState } from 'react';
import { Container, TextField, Button, AppBar, Toolbar, Typography, CircularProgress, Box, Paper, Grid } from '@mui/material';
import Noticia, { NoticiaData } from '@/components/Card';
import Link from 'next/link';

export default function HomePage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<NoticiaData[]>([]);
  const [canDownload, setCanDownload] = useState<boolean>(false);

  const handleRequest = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/noticias?dateInicio=${startDate}&dateFin=${endDate}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al recuperar las noticias de la base de datos');
      }

      const noticias = await response.json();
      setData(noticias);
      alert('Noticias recuperadas correctamente');
    } catch (error) {
      console.error('Error al recuperar noticias:', error);
      alert('Hubo un error al recuperar las noticias de la base de datos');
    }
    setIsLoading(false);
  };

  const handleDeleteNews = async (link: string) => {
    try {
      // Eliminar la noticia del estado data sin modificar la base de datos
      const updatedData = data.filter(item => item.link !== link);
      setData(updatedData);
    } catch (error) {
      console.error('Error al eliminar la noticia:', error);
    }
  };

  useEffect(() => {
    setCanDownload(data.length > 0);
  }, [data])

  const handleDownload = () => {
    const contentFilters = data.map(noticia => noticia.contentFilter).join('\n');
    const blob = new Blob([contentFilters], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'noticias.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              Selección de Fecha
            </Typography>
            <TextField
              label="Fecha Inicio"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ mr: 2 }}
            />
            <TextField
              label="Fecha Fin"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ mr: 2 }}
            />
            <Button
              onClick={handleRequest}
              disabled={isLoading}
              variant="contained"
              sx={{ bgcolor: isLoading ? 'gray' : 'black', color: 'white', mr: 2 }}
            >
              {isLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Iniciar Solicitud'}
            </Button>
            {canDownload && (

              <Box sx={{ display: 'flex', alignContent: 'center', mr: 2 }}>
                <Link href="/Filtros" passHref>
                  <Button variant="contained" color="primary" onClick={handleDownload}>
                    Descargar Noticias
                  </Button>
                </Link>
              </Box>
            )}
          </Toolbar>
        </Paper>
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
