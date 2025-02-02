const sqlite3 = require('sqlite3').verbose();

// Conectar a la base de datos (si no existe, se crea automáticamente)
const db = new sqlite3.Database('./database/music.db', (err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite.');
        // Crear la tabla "songs" si no existe
        db.run(`
            CREATE TABLE IF NOT EXISTS songs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                path TEXT NOT NULL,
                username TEXT NOT NULL
            )
        `);
    }
});

module.exports = db;