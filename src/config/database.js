import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    dialectOptions: {
      timezone: '-03:00' // Ajuste conforme necessário
    },
    define: {
      timestamps: false
    },
    logging: console.log // Ative logs para depuração
  }
);

// Teste de conexão
sequelize.authenticate()
  .then(() => console.log('Conexão com o banco de dados bem-sucedida!'))
  .catch((error) => console.error('Erro ao conectar ao banco de dados:', error));

export default sequelize;
