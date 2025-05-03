import express from 'express';
import sequelize from './src/config/database.js';
import authRoutes from './src/routes/authRoutes.js';

const app = express();

app.use(express.json());
app.use('/auth', authRoutes);

sequelize.sync().then(() => {
  console.log("Banco sincronizado");
});

export default app;