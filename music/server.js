const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs'); // Importar fs
const db = require('./database/database'); // Importar la base de datos

const app = express();
const port = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

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
});

// Nueva ruta para listar los archivos subidos
app.get('/list-uploads', (req, res) => {
    const uploadDir = path.join(__dirname, 'uploads');
    
    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'No se pueden listar los archivos' });
        }
        res.json(files);
    });
});

// Servir archivos de la carpeta "uploads"
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});

