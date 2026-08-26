import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, setDoc, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
    const teamRivalName = document.getElementById('team-rival-name');
    const teamRivalHistory = document.getElementById('team-rival-history');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    const profileMsg = document.getElementById('profile-msg');

    // Eliminar
    const deleteList = document.getElementById('delete-list');

    let firebaseTeams = [];
    let currentSelectedTeam = null;

    loginBtn.addEventListener('click', async () => {
        if (passwordInput.value === 'copa1102') {
            loginSection.style.display = 'none';
            loginError.textContent = 'Cargando datos de la base de datos...';
            loginError.style.color = '#fff';
            loginError.style.display = 'block';

            await syncData(); 
            await loadTeamsFromFirebase();
            
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
        }
    }

    async function loadTeamsFromFirebase() {
        firebaseTeams = [];
        teamSelect.innerHTML = '<option value="" disabled selected>-- Elige un equipo --</option>'; 
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
                teamRivalName.value = currentSelectedTeam.rival.name || "";
                teamRivalHistory.value = currentSelectedTeam.rival.history || "";
            } else {
                teamRivalName.value = "";
                teamRivalHistory.value = "";
            }

            renderDeleteList();
        }
    });

    // Guardar Perfil
    saveProfileBtn.addEventListener('click', async () => {
        if (!currentSelectedTeam) return;

        saveProfileBtn.disabled = true;
        saveProfileBtn.textContent = "Guardando...";

        const teamRef = doc(db, "teams", currentSelectedTeam.docId);
        
        // Mantener el logo si ya existe
        const rivalLogo = (currentSelectedTeam.rival && currentSelectedTeam.rival.logo) ? currentSelectedTeam.rival.logo : "";

        await updateDoc(teamRef, {
            description: teamDescInput.value,
            rival: {
                name: teamRivalName.value,
                history: teamRivalHistory.value,
                logo: rivalLogo
            }
        });

        // Actualizar el objeto local
        currentSelectedTeam.description = teamDescInput.value;
        currentSelectedTeam.rival = { name: teamRivalName.value, history: teamRivalHistory.value, logo: rivalLogo };

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

        if (!name) {
            saveMsg.style.color = '#ff4d4d';
            saveMsg.textContent = 'El nombre de la copa es obligatorio.';
            return;
        }

        const newRecord = { name, result, note };

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
            { id: 'thirdPlaces', label: '🥉 Tercer Puesto' }
        ];

        let hasItems = false;

        categories.forEach(cat => {
            const items = currentSelectedTeam[cat.id] || [];
            items.forEach(item => {
                hasItems = true;
                const li = document.createElement('li');
                
                const textSpan = document.createElement('span');
                textSpan.textContent = `${cat.label} - ${item.name}`;

                const buttonsDiv = document.createElement('div');
                buttonsDiv.style.display = 'flex';
                buttonsDiv.style.gap = '5px';

                const editBtn = document.createElement('button');
                editBtn.textContent = 'Editar';
                editBtn.classList.add('edit-btn');
                editBtn.addEventListener('click', () => editTrophy(cat.id, item));

                const delBtn = document.createElement('button');
                delBtn.textContent = 'Borrar';
                delBtn.classList.add('delete-btn');
                delBtn.addEventListener('click', () => deleteTrophy(cat.id, item));

                buttonsDiv.appendChild(editBtn);
                buttonsDiv.appendChild(delBtn);

                li.appendChild(textSpan);
                li.appendChild(buttonsDiv);
                deleteList.appendChild(li);
            });
        });

        if (!hasItems) {
            deleteList.innerHTML = '<li style="justify-content:center; color:#777;">No hay trofeos registrados</li>';
        }
    }

    function editTrophy(trophyType, item) {
        document.getElementById('trophy-type').value = trophyType;
        document.getElementById('tournament-name').value = item.name || "";
        document.getElementById('tournament-result').value = item.result || "";
        document.getElementById('tournament-note').value = item.note || "";
        
        editingTrophy = item;
        editingTrophyType = trophyType;

        saveTrophyBtn.textContent = "Actualizar Resultado";
        saveTrophyBtn.style.backgroundColor = "#f39c12"; // Destacar que está en modo edición
        saveTrophyBtn.style.color = "#000";
        
        // Hacer scroll hacia el formulario
        window.scrollTo({ top: document.getElementById('editor-sections').offsetTop - 20, behavior: 'smooth' });
    }

    async function deleteTrophy(trophyType, itemObject) {
        if (!confirm(`¿Estás seguro de que deseas eliminar: ${itemObject.name}?`)) return;

        const teamRef = doc(db, "teams", currentSelectedTeam.docId);
        
        try {
            await updateDoc(teamRef, {
                [trophyType]: arrayRemove(itemObject)
            });

            // Actualizar array local filtrándolo
            currentSelectedTeam[trophyType] = currentSelectedTeam[trophyType].filter(
                t => t.name !== itemObject.name || t.result !== itemObject.result || t.note !== itemObject.note
            );
            
            renderDeleteList();
            alert("Eliminado con éxito.");
        } catch (error) {
            console.error(error);
            alert("Error al eliminar.");
        }
    }
});
