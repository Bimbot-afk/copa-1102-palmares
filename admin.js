import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, setDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
    const loginBtn = document.getElementById('login-btn');
    const passwordInput = document.getElementById('admin-password');
    const loginError = document.getElementById('login-error');
    
    const teamSelect = document.getElementById('team-select');
    const saveBtn = document.getElementById('save-btn');
    const saveMsg = document.getElementById('save-msg');

    // Mantenemos esta variable para acceder a los equipos cargados desde Firebase
    let firebaseTeams = [];

    loginBtn.addEventListener('click', async () => {
        if (passwordInput.value === 'copa1102') { // Podemos mejorar la seguridad luego
            loginSection.style.display = 'none';
            loginError.textContent = 'Cargando datos de la base de datos...';
            loginError.style.color = '#fff';
            loginError.style.display = 'block';

            await syncData(); // Nos aseguramos de que haya datos
            await loadTeamsFromFirebase();
            
            loginError.style.display = 'none';
            dashboardSection.style.display = 'block';
        } else {
            loginError.textContent = 'Contraseña incorrecta.';
            loginError.style.color = '#ff4d4d';
        }
    });

    // Esta función sube los datos de tu data.js a Firebase SI Firebase está vacío
    async function syncData() {
        const querySnapshot = await getDocs(collection(db, "teams"));
        if (querySnapshot.empty) {
            console.log("Firebase está vacío. Subiendo los datos desde data.js...");
            // window.teams viene de data.js
            for (const team of window.teams) {
                await setDoc(doc(db, "teams", team.id), team);
            }
            console.log("¡Datos subidos con éxito!");
        }
    }

    async function loadTeamsFromFirebase() {
        firebaseTeams = [];
        teamSelect.innerHTML = ''; // Limpiar select
        const querySnapshot = await getDocs(collection(db, "teams"));
        
        querySnapshot.forEach((docSnap) => {
            const teamData = docSnap.data();
            teamData.docId = docSnap.id; // Guardamos el ID del documento
            firebaseTeams.push(teamData);
        });

        // Ordenarlos alfabéticamente en el panel
        firebaseTeams.sort((a, b) => a.name.localeCompare(b.name));

        firebaseTeams.forEach((team) => {
            const option = document.createElement('option');
            option.value = team.docId; // Usamos el ID del documento de firebase
            option.textContent = team.name;
            teamSelect.appendChild(option);
        });
    }

    // Guardar el torneo en Firebase
    saveBtn.addEventListener('click', async () => {
        const teamDocId = teamSelect.value;
        const trophyType = document.getElementById('trophy-type').value;
        const name = document.getElementById('tournament-name').value;
        const result = document.getElementById('tournament-result').value;
        const note = document.getElementById('tournament-note').value;

        if (!name) {
            saveMsg.style.color = '#ff4d4d';
            saveMsg.textContent = 'El nombre de la copa es obligatorio.';
            return;
        }

        const newRecord = {
            name: name,
            result: result,
            note: note
        };

        saveBtn.disabled = true;
        saveBtn.textContent = "Guardando en la nube...";

        try {
            const teamRef = doc(db, "teams", teamDocId);
            
            // Usamos arrayUnion para añadir el nuevo trofeo al array existente en Firebase
            await updateDoc(teamRef, {
                [trophyType]: arrayUnion(newRecord)
            });

            saveMsg.style.color = '#2ecc71';
            saveMsg.textContent = '¡Torneo guardado oficialmente en la nube!';
            
            // Limpiar campos
            document.getElementById('tournament-name').value = '';
            document.getElementById('tournament-result').value = '';
            document.getElementById('tournament-note').value = '';
        } catch (error) {
            console.error("Error updating document: ", error);
            saveMsg.style.color = '#ff4d4d';
            saveMsg.textContent = 'Hubo un error al guardar. Revisa la consola.';
        }

        saveBtn.disabled = false;
        saveBtn.textContent = "Guardar Resultado";

        setTimeout(() => {
            saveMsg.textContent = '';
        }, 4000);
    });
});
