// Función para cargar la lista de canciones
async function loadSongs() {
    try {
        const response = await fetch('/songs');
        if (!response.ok) {
            throw new Error('Error al cargar las canciones');
        }
        const songs = await response.json();
        const songList = document.getElementById('songList');
        songList.innerHTML = songs.map(song => `
            <li>
                <span onclick="playSong('${song.path}')">${song.name}</span>
                <button onclick="deleteSong(${song.id})">Eliminar</button>
            </li>
        `).join('');
    } catch (error) {
        console.error('Error:', error);
        alert('No se pudieron cargar las canciones. Inténtalo de nuevo.');
    }
}

// Función para reproducir una canción
function playSong(songPath) {
    const audioPlayer = document.getElementById('audioPlayer');
    audioPlayer.src = songPath; // Establecer la ruta de la canción
    audioPlayer.play(); // Reproducir la canción
}

// Función para eliminar una canción
async function deleteSong(songId) {
    const confirmDelete = confirm('¿Estás seguro de que quieres eliminar esta canción?');
    if (!confirmDelete) return;

    try {
        const response = await fetch(`/songs/${songId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Error al eliminar la canción');
        }

        const result = await response.json();
        alert(result.message);
        loadSongs(); // Recargar la lista de canciones
    } catch (error) {
        console.error('Error:', error);
        alert('No se pudo eliminar la canción. Inténtalo de nuevo.');
    }
}

// Función para manejar la subida de archivos
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Error al subir la canción');
        }

        const result = await response.json();
        alert('Canción subida correctamente');
        loadSongs(); // Recargar la lista de canciones
    } catch (error) {
        console.error('Error:', error);
        alert('No se pudo subir la canción. Inténtalo de nuevo.');
    }
});

// Cargar las canciones al iniciar la página
loadSongs();
