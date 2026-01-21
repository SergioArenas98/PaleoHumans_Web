const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const DIST_FOLDER = path.join(__dirname, 'dist', 'paleohumans-front');

app.use(express.static(DIST_FOLDER));
app.get('*', (req, res) => res.sendFile(path.join(DIST_FOLDER, 'index.html')));

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
