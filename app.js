import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

    // Cargar Noticias
    try {
        const globalSnap = await getDoc(doc(db, "settings", "global"));
        if (globalSnap.exists() && globalSnap.data().breakingNews) {
            document.getElementById('news-marquee').textContent = globalSnap.data().breakingNews;
            document.getElementById('news-container').style.display = 'flex';
        }
    } catch (e) {
        console.error("No se pudieron cargar las noticias", e);
    }

    // Descargar equipos desde Firebase
    let teams = [];
    try {
        const querySnapshot = await getDocs(collection(db, "teams"));
        querySnapshot.forEach((docSnap) => {
            const teamData = docSnap.data();
            teamData.docId = docSnap.id;
            teams.push(teamData);
        });
        
        if (teams.length === 0) {
            grid.innerHTML = '<p style="color:white;">Base de datos vacía. Entra al Panel de Administrador para subir los datos.</p>';
            return;
        }
    } catch (error) {
        console.error("Error cargando firebase: ", error);
        grid.innerHTML = '<p style="color:red;">Error de conexión. Revisa que Firebase esté configurado.</p>';
        return;
    }
    
    grid.innerHTML = ''; 

    // Ordenar los equipos para el grid
    teams.sort((a, b) => (b.championships ? b.championships.length : 0) - (a.championships ? a.championships.length : 0));

    // Generar Ranking
    const rankingBody = document.getElementById('ranking-body');
    const rankedTeams = [...teams].map(team => {
        const gold = team.championships ? team.championships.length : 0;
        const silver = team.runnerUps ? team.runnerUps.length : 0;
        const bronze = team.thirdPlaces ? team.thirdPlaces.length : 0;
        return {
            ...team,
            points: (gold * 3) + (silver * 2) + (bronze * 1),
            gold, silver, bronze
        };
    }).sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.gold !== a.gold) return b.gold - a.gold;
        if (b.silver !== a.silver) return b.silver - a.silver;
        return b.bronze - a.bronze;
    });

    rankedTeams.forEach((team, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td style="text-align: left; display: flex; align-items: center; gap: 10px;">
                <img src="${team.logo}" width="25" height="25" style="object-fit: contain;">
                ${team.name}
            </td>
            <td><strong>${team.points}</strong></td>
            <td>${team.gold}</td>
            <td>${team.silver}</td>
            <td>${team.bronze}</td>
        `;
        rankingBody.appendChild(tr);
    });

    // Populate GOAT Section
    if (rankedTeams.length > 0) {
        const goat = rankedTeams[0];
        document.getElementById('goat-logo').src = goat.logo;
        document.getElementById('goat-name').textContent = goat.name;
        document.getElementById('goat-section').style.display = 'block';
    }

    // Map of team colors
    const teamColors = {
        "FC_Domo": "#a50044",           // Barcelona (Red/Dark)
        "FC_Mirezra": "#ffffff",        // Real Madrid (White)
        "Deportivo_Murillo": "#ed1a24", // River (Red)
        "United_Andres": "#da291c",     // Man Utd (Red)
        "Inter_Gerrard": "#009a44",     // Nacional (Green)
        "america_de_huertas": "#e00000",// America (Red)
        "Cristian_FC": "#cccccc",       // Municipal (White/Grey)
        "AC_cagua": "#444444",          // Dark Grey/Black
        "Alianza_Meneses": "#f4d03f"    // Yellow
    };

    // 1. Generar la cuadrícula de equipos
    function renderTeams() {
        teams.forEach(team => {
            const card = document.createElement('div');
            card.classList.add('team-card');
            
            const color = team.color || teamColors[team.id] || '#f39c12';
            card.style.setProperty('--team-color', color);

            // Crear contenedor de estrellas
            const starsDiv = document.createElement('div');
            starsDiv.classList.add('stars-container');
            const numStars = team.championships ? team.championships.length : 0;

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
            card.addEventListener('click', () => openModal(team, color));

            grid.appendChild(card);
        });
    }

    // 2. Funciones del Modal y Vitrina
    const modalStarsContainer = document.getElementById('modal-stars-container');
    const modalContent = document.querySelector('.modal-content');
    const nameText = document.getElementById('name-text');
    const shelfOro = document.getElementById('shelf-oro');
    const shelfPlata = document.getElementById('shelf-plata');
    const shelfBronce = document.getElementById('shelf-bronce');
    
    // Popover
    const popover = document.getElementById('trophy-popover');
    const popTitle = document.getElementById('popover-title');
    const popResult = document.getElementById('popover-result');
    const popNote = document.getElementById('popover-note');
    const closePopoverBtn = document.getElementById('close-popover');

    closePopoverBtn.addEventListener('click', () => {
        popover.classList.add('hidden');
    });

    function showPopover(event, trophy, ownerTeam) {
        popTitle.textContent = trophy.name;
        
        let resultText = trophy.result || "";
        
        // Find opponent name if possible
        if (trophy.opponentId) {
            const opp = teams.find(t => t.docId === trophy.opponentId);
            if (opp) {
                const hasOwner = resultText.toLowerCase().includes(ownerTeam.name.toLowerCase());
                const hasOpp = resultText.toLowerCase().includes(opp.name.toLowerCase());
                
                if (!hasOwner && !hasOpp) {
                    resultText = `${ownerTeam.name} ${resultText} ${opp.name}`;
                }
            }
        }
        
        popResult.textContent = resultText;
        popNote.textContent = trophy.note || "";
        
        // Posicionar popover
        const rect = event.target.getBoundingClientRect();
        popover.style.top = (rect.top + window.scrollY - 100) + 'px'; // Arriba del trofeo
        popover.style.left = (rect.left + window.scrollX - 80) + 'px';
        
        popover.classList.remove('hidden');
        event.stopPropagation();
    }

    function openModal(team, color) {
        popover.classList.add('hidden');
        modalContent.style.setProperty('--team-color', color);
        
        modalLogo.src = team.logo;
        nameText.textContent = team.name;

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
        const modalRivalSection = document.getElementById('modal-rival-section');
        const modalRivalName = document.getElementById('modal-rival-name');
        const modalRivalLogo = document.getElementById('modal-rival-logo');
        const rw = document.getElementById('r-w');
        const rl = document.getElementById('r-l');

        let rivalTeam = null;
        if (team.rival) {
            if (team.rival.id) {
                rivalTeam = teams.find(t => t.docId === team.rival.id);
            } else if (team.rival.name && team.rival.name !== "N/A") {
                // Fallback a nombre viejo
                rivalTeam = teams.find(t => t.name === team.rival.name);
            }
        }

        if (rivalTeam) {
            modalRivalSection.style.display = 'block';
            modalRivalLogo.src = rivalTeam.logo || "";
            modalRivalLogo.style.display = rivalTeam.logo ? 'block' : 'none';
            modalRivalName.textContent = rivalTeam.name;
            
            if (team.rival.stats) {
                rw.textContent = team.rival.stats.w || 0;
                rl.textContent = team.rival.stats.l || 0;
            } else {
                rw.textContent = 0; rl.textContent = 0;
            }
        } else {
            modalRivalSection.style.display = 'none';
        }

        // Récords
        const modalRecordsSection = document.getElementById('modal-records-section');
        const bigWinText = document.getElementById('biggest-win-text');
        const bigLossText = document.getElementById('biggest-loss-text');
        const bigWinContainer = document.getElementById('biggest-win-container');
        const bigLossContainer = document.getElementById('biggest-loss-container');

        if (team.biggestWin || team.biggestLoss) {
            modalRecordsSection.style.display = 'block';
            
            if (team.biggestWin) {
                bigWinContainer.style.display = 'block';
                bigWinText.textContent = team.biggestWin;
            } else {
                bigWinContainer.style.display = 'none';
            }

            if (team.biggestLoss) {
                bigLossContainer.style.display = 'block';
                bigLossText.textContent = team.biggestLoss;
            } else {
                bigLossContainer.style.display = 'none';
            }
        } else {
            modalRecordsSection.style.display = 'none';
        }

        // Insignias
        const badgesSection = document.getElementById('modal-badges-section');
        const badgesContainer = document.getElementById('modal-badges-container');
        if (team.badges && team.badges.length > 0) {
            badgesSection.style.display = 'block';
            badgesContainer.innerHTML = '';
            team.badges.forEach(badge => {
                const badgeDiv = document.createElement('div');
                badgeDiv.classList.add('badge-item');
                badgeDiv.innerHTML = `
                    <div class="badge-icon">${badge.icon}</div>
                    <div class="badge-info">
                        <span class="badge-title">${badge.title}</span>
                        <span class="badge-desc">${badge.description}</span>
                    </div>
                `;
                badgesContainer.appendChild(badgeDiv);
            });
        } else {
            badgesSection.style.display = 'none';
        }

        // Vitrina (Repisas y conteos)
        countChamp.textContent = team.championships ? team.championships.length : 0;
        countRunner.textContent = team.runnerUps ? team.runnerUps.length : 0;
        countThird.textContent = team.thirdPlaces ? team.thirdPlaces.length : 0;

        shelfOro.innerHTML = '';
        shelfPlata.innerHTML = '';
        shelfBronce.innerHTML = '';

        const renderTrophies = (shelf, trophies, imageSrc) => {
            if (trophies) {
                trophies.forEach(t => {
                    const img = document.createElement('img');
                    img.src = imageSrc;
                    img.classList.add('trophy-img');
                    img.addEventListener('click', (e) => showPopover(e, t, team));
                    shelf.appendChild(img);
                });
            }
        };

        renderTrophies(shelfOro, team.championships, "eFotball league/oro-removebg-preview.png");
        renderTrophies(shelfPlata, team.runnerUps, "eFotball league/plata.png");
        renderTrophies(shelfBronce, team.thirdPlaces, "eFotball league/bromce-removebg-preview.png");

        modal.style.display = 'flex';
    }

    // 3. Cerrar Modal
    function closeModal() {
        modal.style.display = 'none';
        popover.classList.add('hidden');
    }

    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
        else if (!popover.contains(e.target) && !e.target.classList.contains('trophy-img')) {
            popover.classList.add('hidden');
        }
    });

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

// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    const currentTheme = localStorage.getItem('theme') || 'dark';
    if (currentTheme === 'light') {
        document.body.classList.add('light-theme');
        themeToggle.textContent = '?? Oscuro';
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        if (document.body.classList.contains('light-theme')) {
            localStorage.setItem('theme', 'light');
            themeToggle.textContent = '?? Oscuro';
        } else {
            localStorage.setItem('theme', 'dark');
            themeToggle.textContent = '?? Claro';
        }
    });
}
