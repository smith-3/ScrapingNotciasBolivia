"use client";

import * as React from 'react';
import { useState } from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Backdrop from '@mui/material/Backdrop';
import { styled } from '@mui/material/styles';

export interface NoticiaData {
    title: string;
    date: string;
    link: string;
    content: string;
    linkImage: string;
    page: string;
    contentFilter: string;
}

export interface NoticiaProps {
    title: string;
    date: string;
    link: string;
    content: string;
    linkImage: string;
    page: string;
    handleDeleteNews?: (link: string) => void;
}

// Estilos para las etiquetas de página
const PageTag = styled(Typography)(({ theme, children }) => ({
    backgroundColor: children === 'Los Tiempos' ? '#CBB500' :
    children === 'Opinion' ? '#d32f2f' :
    children === 'El Deber' ? '#388e3c' : '#757575',
    color: 'white',
    padding: '2px 6px',
    borderRadius: '4px',
    display: 'inline-block',
    marginBottom: '8px'
}));

const Noticia: React.FC<NoticiaProps> = ({ title, date, link, content, linkImage, page, handleDeleteNews }) => {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const truncateContent = (text: string, limit: number) => {
        if (text.length > limit) {
            return text.substring(0, limit) + '...';
        }
        return text;
    };

    const onDelete = async () => {
        try {
            if(handleDeleteNews)
                await handleDeleteNews(link);
        } catch (error) {
            console.error('Error al eliminar la noticia:', error);
        }
    };

    return (
        <>
            <Card variant="outlined" sx={{ maxWidth: 345, mb: 2 }}>
                <CardMedia
                    component="img"
                    alt={title}
                    height="140"
                    image={linkImage}
                />
                <CardContent>
                    <PageTag variant="caption">{page}</PageTag>
                    <Typography gutterBottom variant="h5" component="div">
                        {title}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        {date}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {truncateContent(content, 100)}
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button size="small" onClick={handleOpen} sx={{ color: '#1976d2' }}>
                        Leer más
                    </Button>
                    {handleDeleteNews &&
                    <Button size="small" onClick={() => handleDeleteNews(link)} sx={{ color: 'red' }}>
                        Eliminar
                    </Button>
                    }
                </CardActions>
            </Card>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                    sx: { backgroundColor: 'rgba(0, 0, 0, 0.5)' }
                }}
            >
                <Box sx={{
                    backgroundColor: 'white',
                    padding: 4,
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    maxWidth: '80vw',
                    maxHeight: '80vh',
                    overflowY: 'auto',
                    borderRadius: 4,
                    boxShadow: 24,
                }}>
                    <CardMedia
                        component="img"
                        alt={title}
                        sx={{ maxHeight: 200, objectFit: 'cover' }}
                        image={linkImage}
                    />
                    <Box sx={{
                        paddingRight: 2,
                        paddingLeft: 2,
                        paddingTop: 2
                    }}>
                        <PageTag variant="caption">{page}</PageTag>
                        <Typography id="modal-title" variant="h5" mt={2}>{title}</Typography>
                        <Typography variant="subtitle1" mt={1} mb={2}>{date}</Typography>
                        <Typography id="modal-description" variant="body1" mb={2}>{truncateContent(content, 500)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Button onClick={handleClose} variant="contained" color="error">
                            Cerrar
                        </Button>
                        <Button variant="contained" color="primary" href={link} target="_blank">
                            Leer más en la página
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </>
    );
};

export default Noticia;
