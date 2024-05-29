"use client";

import React, { useEffect, useState } from 'react';
import { Container, TextField, Button, AppBar, Toolbar, Typography, CircularProgress, Box, Paper, Grid, Chip } from '@mui/material';
import Noticia, { NoticiaData } from '@/components/Card';

export interface WordData {
  word: string;
  total: number;
  filtrar: boolean;
}

export default function Filtros() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<NoticiaData[]>([]);
  const [words, setWords] = useState<WordData[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [selectedPages, setSelectedPages] = useState<string[]>([]);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    setUploadedFile(file);
    setIsFileLoading(true);
  };

  useEffect(() => {
    const processFile = async () => {
      if (uploadedFile) {
        const text = await uploadedFile.text();
        const wordMap: { [key: string]: number } = {};

        text.split('\n').forEach(line => {
          const [word, total] = line.trim().split(/\s+/);
          if (word && total) {
            if (wordMap[word]) {
              wordMap[word] += parseInt(total);
            } else {
              wordMap[word] = parseInt(total);
            }
          }
        });

        const parsedWords = Object.entries(wordMap)
          .map(([word, total]) => ({ word, total, filtrar: false }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 10);  // Obtener solo las primeras 10 entradas

        setWords(parsedWords);
        setIsFileLoading(false);
      }
    };
    processFile();
  }, [uploadedFile]);

  const toggleFilter = (word: string) => {
    setWords(words.map(w => w.word === word ? { ...w, filtrar: !w.filtrar } : w));
  };

  const togglePageFilter = (page: string) => {
    setSelectedPages(prevSelectedPages =>
      prevSelectedPages.includes(page)
        ? prevSelectedPages.filter(p => p !== page)
        : [...prevSelectedPages, page]
    );
  };

  const filteredData = data
    .filter(noticia =>
      selectedPages.length === 0 || selectedPages.includes(noticia.page)
    )
    .filter(noticia =>
      words.some(word => word.filtrar)
        ? words.filter(word => word.filtrar).some(word =>
          noticia.title?.toLowerCase().includes(word.word.toLowerCase())
        )
        : true
    );

  return (
    <div style={{ minHeight: '100vh', minWidth: '100vh', backgroundColor: '#f5f5f5' }}>
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
            <label htmlFor="file-upload">
              <Button
                component="span"
                variant="outlined"
                disabled={isFileLoading}
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 2,
                  backgroundColor: 'white',
                  margin: '0 auto',
                  mr: 2
                }}
              >
                {isFileLoading ? <CircularProgress size={24} /> : 'Cargar Map Reduce'}
              </Button>
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".txt"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </Toolbar>
          <Box sx={{ mt: 2 }}>
            <Button
              variant={selectedPages.includes('El Deber') ? 'contained' : 'outlined'}
              color="success"
              onClick={() => togglePageFilter('El Deber')}
              sx={{ mr: 1 }}
            >
              El Deber
            </Button>
            <Button
              variant={selectedPages.includes('Los Tiempos') ? 'contained' : 'outlined'}
              color="warning"
              onClick={() => togglePageFilter('Los Tiempos')}
              sx={{ mr: 1 }}
            >
              Los Tiempos
            </Button>
            <Button
              variant={selectedPages.includes('Opinion') ? 'contained' : 'outlined'}
              color="error"
              onClick={() => togglePageFilter('Opinion')}
            >
              Opinion
            </Button>
          </Box>
        </Paper>
        <Box sx={{ mt: 4 }}>
          {words.length > 0 && (
            <Box sx={{ mb: 2, display: 'flex', overflowX: 'auto', whiteSpace: 'nowrap' }}>
              {words.map((word, index) => (
                <Chip
                  key={index}
                  label={`${word.word} (${word.total})`}
                  onClick={() => toggleFilter(word.word)}
                  color={word.filtrar ? 'primary' : 'default'}
                  sx={{ margin: '2px' }}
                />
              ))}
            </Box>
          )}
          {filteredData.length > 0 ? (
            <Grid container spacing={3}>
              {filteredData.map((item, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Noticia
                    title={item.title}
                    date={item.date}
                    link={item.link}
                    content={item.content}
                    page={item.page}
                    linkImage={item.linkImage}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="h6" sx={{ mt: 4, textAlign: 'center', color: 'grey' }}>
              No hay noticias que coincidan con los filtros seleccionados
            </Typography>
          )}
        </Box>
      </Container>
    </div>
  );
}
