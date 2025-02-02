// Función para mostrar los mensajes con estilo
function showMessage(message, type) { 
    const messageBox = document.getElementById('messageBox');
    messageBox.textContent = message;
    messageBox.className = `alert ${type}`;  // 'alert success' o 'alert error'
    messageBox.style.display = 'block';

    // Ocultar el mensaje después de 4 segundos
    setTimeout(() => {
        messageBox.style.display = 'none';
    }, 4000);
}

// Obtener el reproductor de audio y el GIF de barras de sonido
const audioPlayer = document.getElementById('audioPlayer');
const soundBars = document.getElementById('soundBars');

// Mostrar el GIF cuando la canción se reproduce
audioPlayer.addEventListener('play', () => {
    soundBars.style.display = 'block';  // Mostrar el GIF
});

// Ocultar el GIF cuando la canción se pausa
audioPlayer.addEventListener('pause', () => {
    soundBars.style.display = 'none';  // Ocultar el GIF
});

// También podemos ocultarlo si la canción termina
audioPlayer.addEventListener('ended', () => {
    soundBars.style.display = 'none';  // Ocultar el GIF cuando la canción termina
});

// Función para cargar la lista de canciones
async function loadSongs() {
    try {
        const response = await fetch('/songs');
        if (!response.ok) {
            throw new Error('❌ Error al cargar las canciones');
        }
        const songs = await response.json();
        const songList = document.getElementById('songList');
        songList.innerHTML = songs.map(song => `
            <li onclick="playSong('${song.path}')">
                <div>
                    <span>${song.name}</span>
                    <small>Subido por: ${song.username}</small>
                </div>
                <button onclick="askDeleteSong(${song.id}, '${song.name}', event)">Eliminar</button>
            </li>
        `).join('');
    } catch (error) {
        console.error('Error:', error);
        showMessage('❌ No se pudieron cargar las canciones. Inténtalo de nuevo.', 'error');
    }
}

// Función para reproducir una canción
function playSong(songPath) {
    const audioPlayer = document.getElementById('audioPlayer');
    audioPlayer.src = songPath; // Establecer la ruta de la canción
    audioPlayer.play(); // Reproducir la canción
}

// Función para pedir confirmación para eliminar una canción
function askDeleteSong(songId, songName, event) {
    event.stopPropagation(); // Evitar que el clic en el botón dispare la reproducción
    const confirmationBox = document.getElementById('confirmationBox');
    confirmationBox.style.display = 'block';
    document.getElementById('confirmDeleteButton').onclick = () => deleteSong(songId);
    document.getElementById('cancelDeleteButton').onclick = () => confirmationBox.style.display = 'none';
    document.getElementById('confirmationMessage').textContent = `⚠️¿Estás seguro de que quieres eliminar "${songName}"?⚠️`;
}

// Función para eliminar una canción
async function deleteSong(songId) {
    const confirmationBox = document.getElementById('confirmationBox');
    confirmationBox.style.display = 'none'; // Cerrar la caja de confirmación

    try {
        const response = await fetch(`/songs/${songId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('❌ Error al eliminar la canción');
        }

        const result = await response.json();
        showMessage(result.message, 'success');
        loadSongs(); // Recargar la lista de canciones
    } catch (error) {
        console.error('Error:', error);
        showMessage('❌ No se pudo eliminar la canción, probablemente sea porque está bugueadisimo así que no te ralles e inténtalo de nuevo.', 'error');
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
            throw new Error('❌ Error al subir la canción');
        }

        const result = await response.json();
        showMessage('✅ Canción subida correctamente', 'success');
        loadSongs(); // Recargar la lista de canciones
    } catch (error) {
        console.error('Error:', error);
        showMessage('❌ No se pudo subir la canción, verifica la contraseña.', 'error');
    }
});

// Cargar las canciones al iniciar la página
loadSongs();
