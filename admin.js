import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, setDoc, updateDoc, arrayUnion, arrayRemove, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const editorSections = document.getElementById('editor-sections');
    const loginBtn = document.getElementById('login-btn');
    const passwordInput = document.getElementById('admin-password');
    const loginError = document.getElementById('login-error');
    
    const teamSelect = document.getElementById('team-select');
    
    // Trofeos
    const saveTrophyBtn = document.getElementById('save-trophy-btn');
    const saveMsg = document.getElementById('save-msg');
    
    // Perfil
    const teamDescInput = document.getElementById('team-description-input');
    const teamRivalSelect = document.getElementById('team-rival-select');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    const profileMsg = document.getElementById('profile-msg');

    // Eliminar
    const deleteList = document.getElementById('delete-list');

    let firebaseTeams = [];
    let currentSelectedTeam = null;

    loginBtn.addEventListener('click', async () => {
        const p = passwordInput.value;
        if (p === 'admin1102') {
            loginSection.style.display = 'none';
            loginError.textContent = 'Cargando datos de la base de datos...';
            loginError.style.color = '#fff';
            loginError.style.display = 'block';

            await syncData(); 
            await loadTeamsFromFirebase();
            await loadNews();
            
            loginError.style.display = 'none';
            dashboardSection.style.display = 'block';
        } else {
            loginError.textContent = 'Contraseña incorrecta.';
            loginError.style.color = '#ff4d4d';
        }
    });

    async function syncData() {
        const querySnapshot = await getDocs(collection(db, "teams"));
        if (querySnapshot.empty) {
            for (const team of window.teams) {
                await setDoc(doc(db, "teams", team.id), team);
            }
        } else {
            // MIGRATION SCRIPT
            const allTeams = [];
            querySnapshot.forEach(docSnap => {
                const t = docSnap.data();
                t.docId = docSnap.id;
                allTeams.push(t);
            });

            const teamNamesMap = {};
            allTeams.forEach(t => teamNamesMap[t.name] = t.docId);

            for (const team of allTeams) {
                let needsUpdate = false;
                const updatePayload = {};

                ['championships', 'runnerUps', 'thirdPlaces'].forEach(cat => {
                    if (team[cat]) {
                        team[cat].forEach(trophy => {
                            if (!trophy.opponentId && trophy.result) {
                                // Find opponent name in result string
                                for (const name in teamNamesMap) {
                                    if (name !== team.name && trophy.result.includes(name)) {
                                        trophy.opponentId = teamNamesMap[name];
                                        needsUpdate = true;
                                        break;
                                    }
                                }
                            }
                        });
                        if (needsUpdate) updatePayload[cat] = team[cat];
                    }
                });

                if (needsUpdate) {
                    await updateDoc(doc(db, "teams", team.docId), updatePayload);
                }
            }
        }
    }

    async function loadTeamsFromFirebase() {
        firebaseTeams = [];
        teamSelect.innerHTML = '<option value="" disabled selected>-- Elige un equipo --</option>'; 
        const oppSelect = document.getElementById('tournament-opponent');
        oppSelect.innerHTML = '<option value="">-- Ninguno / Desconocido --</option>';
        teamRivalSelect.innerHTML = '<option value="">-- Ninguno --</option>';

        const querySnapshot = await getDocs(collection(db, "teams"));
        
        querySnapshot.forEach((docSnap) => {
            const teamData = docSnap.data();
            teamData.docId = docSnap.id; 
            firebaseTeams.push(teamData);
        });

        firebaseTeams.sort((a, b) => a.name.localeCompare(b.name));

        firebaseTeams.forEach((team) => {
            const option = document.createElement('option');
            option.value = team.docId; 
            option.textContent = team.name;
            teamSelect.appendChild(option);

            const oppOption = document.createElement('option');
            oppOption.value = team.docId; 
            oppOption.textContent = team.name;
            oppSelect.appendChild(oppOption);
            
            const rivOption = document.createElement('option');
            rivOption.value = team.docId; 
            rivOption.textContent = team.name;
            teamRivalSelect.appendChild(rivOption);
        });
    }

    // Al seleccionar un equipo, mostrar las opciones
    teamSelect.addEventListener('change', () => {
        const selectedId = teamSelect.value;
        currentSelectedTeam = firebaseTeams.find(t => t.docId === selectedId);
        
        if (currentSelectedTeam) {
            editorSections.style.display = 'block';
            
            // Llenar perfil
            teamDescInput.value = currentSelectedTeam.description || "";

            if (currentSelectedTeam.rival) {
                // Compatible con formato viejo (name) o nuevo (id)
                if (currentSelectedTeam.rival.id) {
                    teamRivalSelect.value = currentSelectedTeam.rival.id;
                } else if (currentSelectedTeam.rival.name) {
                    // Tratar de mapear nombre viejo a ID
                    const oldRival = firebaseTeams.find(t => t.name === currentSelectedTeam.rival.name);
                    teamRivalSelect.value = oldRival ? oldRival.docId : "";
                } else {
                    teamRivalSelect.value = "";
                }
                
                if (currentSelectedTeam.rival.stats) {
                    document.getElementById('rival-w').value = currentSelectedTeam.rival.stats.w || "";
                    document.getElementById('rival-l').value = currentSelectedTeam.rival.stats.l || "";
                } else {
                    document.getElementById('rival-w').value = "";
                    document.getElementById('rival-l').value = "";
                }
            } else {
                teamRivalSelect.value = "";
            }
            
            document.getElementById('team-biggest-win').value = currentSelectedTeam.biggestWin || "";
            document.getElementById('team-biggest-loss').value = currentSelectedTeam.biggestLoss || "";

            renderDeleteList();
        }
    });

    // Guardar Perfil
    saveProfileBtn.addEventListener('click', async () => {
        if (!currentSelectedTeam) return;

        saveProfileBtn.disabled = true;
        saveProfileBtn.textContent = "Guardando...";

        const teamRef = doc(db, "teams", currentSelectedTeam.docId);
        
        const rivalStats = {
            w: document.getElementById('rival-w').value || 0,
            l: document.getElementById('rival-l').value || 0
        };

        const bWin = document.getElementById('team-biggest-win').value;
        const bLoss = document.getElementById('team-biggest-loss').value;
        const rId = teamRivalSelect.value;

        await updateDoc(teamRef, {
            description: teamDescInput.value,
            biggestWin: bWin,
            biggestLoss: bLoss,
            rival: {
                id: rId,
                stats: rivalStats
            }
        });

        // Actualizar el objeto local
        currentSelectedTeam.description = teamDescInput.value;
        currentSelectedTeam.biggestWin = bWin;
        currentSelectedTeam.biggestLoss = bLoss;
        currentSelectedTeam.rival = { id: rId, stats: rivalStats };

        profileMsg.textContent = "¡Perfil actualizado!";
        saveProfileBtn.disabled = false;
        saveProfileBtn.textContent = "Guardar Perfil";

        setTimeout(() => profileMsg.textContent = "", 3000);
    });

    // Añadir o Actualizar Trofeo
    let editingTrophy = null;
    let editingTrophyType = null;

    saveTrophyBtn.addEventListener('click', async () => {
        if (!currentSelectedTeam) return;

        const trophyType = document.getElementById('trophy-type').value;
        const name = document.getElementById('tournament-name').value;
        const result = document.getElementById('tournament-result').value;
        const note = document.getElementById('tournament-note').value;
        const opponentId = document.getElementById('tournament-opponent').value;

        if (!name) {
            saveMsg.style.color = '#ff4d4d';
            saveMsg.textContent = 'El nombre de la copa es obligatorio.';
            return;
        }

        const newRecord = { name, result, note, opponentId };

        saveTrophyBtn.disabled = true;
        saveTrophyBtn.textContent = "Guardando...";

        try {
            const teamRef = doc(db, "teams", currentSelectedTeam.docId);
            
            // Si estamos editando, primero borramos el viejo
            if (editingTrophy) {
                await updateDoc(teamRef, {
                    [editingTrophyType]: arrayRemove(editingTrophy)
                });
                // Actualizar array local filtrándolo
                currentSelectedTeam[editingTrophyType] = currentSelectedTeam[editingTrophyType].filter(
                    t => t.name !== editingTrophy.name || t.result !== editingTrophy.result || t.note !== editingTrophy.note
                );
            }

            // Guardamos el nuevo/actualizado
            await updateDoc(teamRef, {
                [trophyType]: arrayUnion(newRecord)
            });

            // Actualizar localmente para la vista
            if (!currentSelectedTeam[trophyType]) currentSelectedTeam[trophyType] = [];
            currentSelectedTeam[trophyType].push(newRecord);

            saveMsg.style.color = '#2ecc71';
            saveMsg.textContent = editingTrophy ? '¡Torneo actualizado!' : '¡Torneo añadido!';
            
            document.getElementById('tournament-name').value = '';
            document.getElementById('tournament-result').value = '';
            document.getElementById('tournament-note').value = '';
            document.getElementById('tournament-opponent').value = '';

            // Limpiar estado de edición
            editingTrophy = null;
            editingTrophyType = null;
            saveTrophyBtn.textContent = "Guardar Resultado";
            saveTrophyBtn.style.backgroundColor = "";

            renderDeleteList(); // Refrescar lista
        } catch (error) {
            saveMsg.style.color = '#ff4d4d';
            saveMsg.textContent = 'Error al guardar.';
        }

        saveTrophyBtn.disabled = false;
        if (!editingTrophy) saveTrophyBtn.textContent = "Guardar Resultado";

        setTimeout(() => saveMsg.textContent = '', 3000);
    });

    // Renderizar lista para eliminar / editar
    function renderDeleteList() {
        deleteList.innerHTML = '';
        
        const categories = [
            { id: 'championships', label: '🥇 Campeonato' },
            { id: 'runnerUps', label: '🥈 Subcampeón' },
            { id: 'thirdPlaces', label: '🥉 Tercer Puesto' },
            { id: 'badges', label: '🏅 Insignia' }
        ];

        let hasItems = false;

        categories.forEach(cat => {
            const items = currentSelectedTeam[cat.id] || [];
            items.forEach(item => {
                hasItems = true;
                const li = document.createElement('li');
                
                const textSpan = document.createElement('span');
                if (cat.id === 'badges') {
                    textSpan.textContent = `${cat.label} - ${item.icon} ${item.title}`;
                } else {
                    textSpan.textContent = `${cat.label} - ${item.name}`;
                }

                const buttonsDiv = document.createElement('div');
                buttonsDiv.style.display = 'flex';
                buttonsDiv.style.gap = '5px';

                if (cat.id !== 'badges') {
                    const editBtn = document.createElement('button');
                    editBtn.textContent = 'Editar';
                    editBtn.classList.add('edit-btn');
                    editBtn.addEventListener('click', () => editTrophy(cat.id, item));
                    buttonsDiv.appendChild(editBtn);
                }

                const delBtn = document.createElement('button');
                delBtn.textContent = 'Borrar';
                delBtn.classList.add('delete-btn');
                delBtn.addEventListener('click', () => deleteItem(cat.id, item));

                buttonsDiv.appendChild(delBtn);

                li.appendChild(textSpan);
                li.appendChild(buttonsDiv);
                deleteList.appendChild(li);
            });
        });

        if (!hasItems) {
            deleteList.innerHTML = '<li style="justify-content:center; color:#777;">No hay registros</li>';
        }
    }

    function editTrophy(trophyType, item) {
        document.getElementById('trophy-type').value = trophyType;
        document.getElementById('tournament-name').value = item.name || "";
        document.getElementById('tournament-result').value = item.result || "";
        document.getElementById('tournament-note').value = item.note || "";
        document.getElementById('tournament-opponent').value = item.opponentId || "";
        
        editingTrophy = item;
        editingTrophyType = trophyType;

        saveTrophyBtn.textContent = "Actualizar Resultado";
        saveTrophyBtn.style.backgroundColor = "#f39c12"; // Destacar que está en modo edición
        saveTrophyBtn.style.color = "#000";
        
        // Hacer scroll hacia el formulario
        window.scrollTo({ top: document.getElementById('editor-sections').offsetTop - 20, behavior: 'smooth' });
    }

    async function deleteItem(type, itemObject) {
        const confirmName = type === 'badges' ? itemObject.title : itemObject.name;
        if (!confirm(`¿Estás seguro de que deseas eliminar: ${confirmName}?`)) return;

        const teamRef = doc(db, "teams", currentSelectedTeam.docId);
        
        try {
            await updateDoc(teamRef, {
                [type]: arrayRemove(itemObject)
            });

            // Actualizar array local filtrándolo
            currentSelectedTeam[type] = currentSelectedTeam[type].filter(t => {
                if(type === 'badges') return t.title !== itemObject.title;
                return t.name !== itemObject.name || t.result !== itemObject.result || t.note !== itemObject.note;
            });
            
            renderDeleteList();
            alert("Eliminado con éxito.");
        } catch (error) {
            console.error(error);
            alert("Error al eliminar.");
        }
    }

    // Insignias
    const badgeTemplate = document.getElementById('badge-template');
    const badgeIcon = document.getElementById('badge-icon');
    const badgeTitle = document.getElementById('badge-title');
    const badgeDesc = document.getElementById('badge-desc');
    const saveBadgeBtn = document.getElementById('save-badge-btn');
    const badgeMsg = document.getElementById('badge-msg');

    badgeTemplate.addEventListener('change', () => {
        if (badgeTemplate.value === 'custom') {
            badgeIcon.value = '';
            badgeTitle.value = '';
            badgeDesc.value = '';
        } else {
            const parts = badgeTemplate.value.split('|');
            badgeIcon.value = parts[0];
            badgeTitle.value = parts[1];
            badgeDesc.value = parts[2];
        }
    });

    saveBadgeBtn.addEventListener('click', async () => {
        if (!currentSelectedTeam) return;
        if (!badgeIcon.value || !badgeTitle.value) {
            badgeMsg.style.color = '#ff4d4d';
            badgeMsg.textContent = 'Icono y Título son obligatorios.';
            return;
        }

        saveBadgeBtn.disabled = true;
        saveBadgeBtn.textContent = 'Guardando...';

        const newBadge = {
            icon: badgeIcon.value,
            title: badgeTitle.value,
            description: badgeDesc.value
        };

        try {
            const teamRef = doc(db, "teams", currentSelectedTeam.docId);
            await updateDoc(teamRef, {
                badges: arrayUnion(newBadge)
            });

            if (!currentSelectedTeam.badges) currentSelectedTeam.badges = [];
            currentSelectedTeam.badges.push(newBadge);

            badgeMsg.style.color = '#2ecc71';
            badgeMsg.textContent = '¡Insignia otorgada!';
            
            badgeIcon.value = '';
            badgeTitle.value = '';
            badgeDesc.value = '';
            badgeTemplate.value = 'custom';

            renderDeleteList();
        } catch (error) {
            badgeMsg.style.color = '#ff4d4d';
            badgeMsg.textContent = 'Error al guardar.';
        }

        saveBadgeBtn.disabled = false;
        saveBadgeBtn.textContent = 'Otorgar Insignia';
        setTimeout(() => badgeMsg.textContent = '', 3000);
    });

    // Noticias
    const newsInput = document.getElementById('news-text');
    const saveNewsBtn = document.getElementById('save-news-btn');
    const newsMsg = document.getElementById('news-msg');
    const globalSettingsRef = doc(db, "settings", "global");

    async function loadNews() {
        const globalSnap = await getDoc(globalSettingsRef);
        if (globalSnap.exists() && globalSnap.data().breakingNews) {
            newsInput.value = globalSnap.data().breakingNews;
        }
    }

    saveNewsBtn.addEventListener('click', async () => {
        const text = newsInput.value;
        saveNewsBtn.textContent = "Publicando...";
        saveNewsBtn.disabled = true;

        try {
            await setDoc(globalSettingsRef, { breakingNews: text }, { merge: true });
            newsMsg.style.color = "#2ecc71";
            newsMsg.textContent = "¡Noticia publicada!";
        } catch (error) {
            newsMsg.style.color = "#ff4d4d";
            newsMsg.textContent = "Error al publicar la noticia.";
        }

        saveNewsBtn.textContent = "Publicar Noticia";
        saveNewsBtn.disabled = false;
        setTimeout(() => newsMsg.textContent = "", 3000);
    });

});
