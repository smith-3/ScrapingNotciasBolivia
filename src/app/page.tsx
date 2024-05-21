"use client";

import React, { useState } from 'react';
import { Container, TextField, Button, AppBar, Toolbar, Typography, CircularProgress, Box, Paper } from '@mui/material';

export default function HopePage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequest = () => {
    setIsLoading(true);
    // Simular una solicitud
    setTimeout(() => {
      setIsLoading(false);
      // Aquí iría la lógica para mostrar las tarjetas en la lista
    }, 2000);
  };

  return (
    <div style={{ minHeight: '100vh'}}>
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
              sx={{ bgcolor: isLoading ? 'gray' : 'black', color: 'white' }}
            >
              {isLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Iniciar Solicitud'}
            </Button>
          </Toolbar>
        </Paper>
        <Box sx={{ mt: 4 }}>
          {/* Aquí se mostrarían las tarjetas en la lista */}
        </Box>
      </Container>
    </div>
  );
}
