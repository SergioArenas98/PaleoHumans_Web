const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Servir archivos estáticos del build de Angular
app.use(express.static(path.join(__dirname, 'dist/paleohumans-front')));

// Catch-all usando app.use en vez de app.get
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, 'dist/paleohumans-front/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
