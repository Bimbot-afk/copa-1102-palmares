const fs = require('fs');
let data = fs.readFileSync('data.js', 'utf8');
data = data.replace(/(logo: ".*",)/g, '$1\n        description: "Escribe aquí la historia o descripción del equipo...",\n        rival: { name: "Nombre del Rival", history: "Jugados: 0 | Ganados: 0" },');
fs.writeFileSync('data.js', data);
console.log("Updated data.js");
