import express from 'express';
import sequelize from './src/config/database.js';
import authRoutes from './src/routes/authRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'src/public'))); // Servir arquivos estáticos

app.use('/auth', authRoutes);

sequelize.sync().then(() => {
    console.log("Banco sincronizado");
}).catch(err => {
    console.error("Erro ao sincronizar banco:", err);
});

export default app;