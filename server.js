const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// Servir archivos estáticos del build de Angular
app.use(express.static(path.join(__dirname, 'dist/paleohumans-front')));

// Redirigir todas las rutas a index.html para Angular Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/paleohumans-front/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
