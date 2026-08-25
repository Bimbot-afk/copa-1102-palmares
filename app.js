import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCzqBWyR7djQKkfwm9vc5SH7NxNdkKcTF8",
    authDomain: "copa-1102.firebaseapp.com",
    projectId: "copa-1102",
    storageBucket: "copa-1102.firebasestorage.app",
    messagingSenderId: "763183663754",
    appId: "1:763183663754:web:57b912bb7a1d40f677fb73"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('teams-grid');
    const modal = document.getElementById('team-modal');
    const closeBtn = document.querySelector('.close-button');

    // Elementos del modal
    const modalLogo = document.getElementById('modal-logo');
    const modalTeamName = document.getElementById('modal-team-name');
    const modalTeamDesc = document.getElementById('modal-team-desc');
    const modalRivalSection = document.getElementById('modal-rival-section');
    const modalRivalLogo = document.getElementById('modal-rival-logo');
    const modalRivalName = document.getElementById('modal-rival-name');
    const modalRivalHistory = document.getElementById('modal-rival-history');
    
    const countChamp = document.getElementById('count-champ');
    const listChamp = document.getElementById('list-champ');
    
    const countRunner = document.getElementById('count-runner');
    const listRunner = document.getElementById('list-runner');
    
    const countThird = document.getElementById('count-third');
    const listThird = document.getElementById('list-third');

    // Ruta a la imagen de la estrella
    const starImagePath = "eFotball league/Estrella.png";

    // Muestra algo mientras carga
    grid.innerHTML = '<p style="color:white; font-size: 1.2rem; grid-column: 1 / -1; text-align: center;">Cargando datos desde la nube...</p>';

    // Descargar equipos desde Firebase
    let teams = [];
    try {
        const querySnapshot = await getDocs(collection(db, "teams"));
        querySnapshot.forEach((doc) => {
            teams.push(doc.data());
        });
        
        // Si Firebase está vacío, mostramos un mensaje
        if (teams.length === 0) {
            grid.innerHTML = '<p style="color:white;">Base de datos vacía. Entra al Panel de Administrador para subir los datos.</p>';
            return;
        }
    } catch (error) {
        console.error("Error cargando firebase: ", error);
        grid.innerHTML = '<p style="color:red;">Error de conexión. Revisa que Firebase esté configurado.</p>';
        return;
    }
    
    grid.innerHTML = ''; // Limpiamos el mensaje de carga

    // Ordenar los equipos para que los más ganadores queden al principio
    teams.sort((a, b) => (b.championships ? b.championships.length : 0) - (a.championships ? a.championships.length : 0));

    // 1. Generar la cuadrícula de equipos
    function renderTeams() {
        teams.forEach(team => {
            const card = document.createElement('div');
            card.classList.add('team-card');

            // Crear contenedor de estrellas
            const starsDiv = document.createElement('div');
            starsDiv.classList.add('stars-container');
            const numStars = team.championships.length;

            for (let i = 0; i < numStars; i++) {
                const starImg = document.createElement('img');
                starImg.src = starImagePath;
                starImg.alt = "Estrella de Campeón";
                starImg.classList.add('star-icon');
                starsDiv.appendChild(starImg);
            }

            // Crear imagen y nombre
            const img = document.createElement('img');
            img.src = team.logo;
            img.alt = `Escudo de ${team.name}`;
            img.classList.add('team-logo');

            const name = document.createElement('div');
            name.classList.add('team-name');
            name.textContent = team.name;

            // Ensamblar tarjeta
            card.appendChild(starsDiv);
            card.appendChild(img);
            card.appendChild(name);

            // Evento click para abrir modal
            card.addEventListener('click', () => openModal(team));

            grid.appendChild(card);
        });
    }

    // 2. Funciones del Modal
    const modalStarsContainer = document.getElementById('modal-stars-container');

    function openModal(team) {
        modalLogo.src = team.logo;
        modalTeamName.textContent = team.name;

        // Estrellas
        modalStarsContainer.innerHTML = '';
        const numStars = team.championships ? team.championships.length : 0;
        for (let i = 0; i < numStars; i++) {
            const starImg = document.createElement('img');
            starImg.src = starImagePath;
            starImg.alt = "Estrella";
            starImg.classList.add('star-icon');
            modalStarsContainer.appendChild(starImg);
        }
        
        // Descripción
        modalTeamDesc.textContent = team.description || "Sin descripción disponible.";
        
        // Rival
        if (team.rival && team.rival.name) {
            modalRivalSection.style.display = 'block';
            modalRivalName.textContent = team.rival.name;
            modalRivalHistory.textContent = team.rival.history || "";
            
            if (team.rival.logo) {
                modalRivalLogo.src = team.rival.logo;
                modalRivalLogo.style.display = 'inline-block';
            } else {
                modalRivalLogo.style.display = 'none';
            }
        } else {
            modalRivalSection.style.display = 'none';
        }

        // Limpiar listas
        listChamp.innerHTML = '';
        listRunner.innerHTML = '';
        listThird.innerHTML = '';

        // Llenar datos
        fillList(listChamp, countChamp, team.championships);
        fillList(listRunner, countRunner, team.runnerUps);
        fillList(listThird, countThird, team.thirdPlaces);

        modal.style.display = 'flex';
    }

    function fillList(ulElement, countElement, dataArray) {
        countElement.textContent = dataArray.length;

        if (dataArray.length === 0) {
            ulElement.innerHTML = '<li style="text-align:center; color:#777;">Sin registros aún</li>';
            return;
        }

        dataArray.forEach(item => {
            const li = document.createElement('li');

            // Nombre del Torneo
            const nameSpan = document.createElement('span');
            nameSpan.classList.add('tournament-name');
            nameSpan.textContent = item.name;

            // Resultado del partido (Opcional)
            let resultSpan = null;
            if (item.result) {
                resultSpan = document.createElement('span');
                resultSpan.classList.add('tournament-result');
                resultSpan.textContent = item.result;
            }

            // Nota del torneo
            const noteSpan = document.createElement('span');
            noteSpan.classList.add('tournament-note');
            noteSpan.textContent = `"${item.note}"`;

            li.appendChild(nameSpan);
            if (resultSpan) li.appendChild(resultSpan);
            li.appendChild(noteSpan);

            ulElement.appendChild(li);
        });
    }

    function closeModal() {
        modal.style.display = 'none';
    }

    // Cerrar al hacer click en la X
    closeBtn.addEventListener('click', closeModal);

    // Cerrar al hacer click fuera del contenido del modal
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Inicializar
    renderTeams();
});
