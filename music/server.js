const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs'); // Importar el módulo fs para manejar archivos
const db = require('./database/database'); // Importar la base de datos

// Inicializar la aplicación Express
const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Servir archivos estáticos (frontend)

// Configurar Multer para la subida de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

const upload = multer({ storage });

// Ruta para subir una canción
app.post('/upload', upload.single('song'), (req, res) => {
    const { originalname, filename } = req.file;
    const songPath = '/uploads/' + filename;

    // Verificar si ya existe una canción con el mismo nombre
    db.get(
        'SELECT * FROM songs WHERE name = ?',
        [originalname],
        (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (row) {
                // Si ya existe una canción con el mismo nombre, devolver un error
                return res.status(400).json({ error: 'Ya existe una canción con este nombre.' });
            }

            // Si no existe, insertar la canción en la base de datos
            db.run(
                'INSERT INTO songs (name, path) VALUES (?, ?)',
                [originalname, songPath],
                function (err) {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    res.json({ id: this.lastID, name: originalname, path: songPath });
                }
            );
        }
    );
});

// Ruta para obtener todas las canciones
app.get('/songs', (req, res) => {
    db.all('SELECT * FROM songs', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Ruta para eliminar una canción
app.delete('/songs/:id', (req, res) => {
    const songId = req.params.id;

    // Obtener la información de la canción antes de eliminarla
    db.get(
        'SELECT * FROM songs WHERE id = ?',
        [songId],
        (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (!row) {
                return res.status(404).json({ error: 'Canción no encontrada.' });
            }

            // Eliminar el archivo de la carpeta "uploads"
            const filePath = path.join(__dirname, row.path);
            fs.unlink(filePath, (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Error al eliminar el archivo.' });
                }

                // Eliminar la canción de la base de datos
                db.run(
                    'DELETE FROM songs WHERE id = ?',
                    [songId],
                    function (err) {
                        if (err) {
                            return res.status(500).json({ error: err.message });
                        }
                        res.json({ message: 'Canción eliminada correctamente.' });
                    }
                );
            });
        }
    );
});

// Servir archivos de la carpeta "uploads"
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});