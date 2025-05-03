import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('security', 'tarcioadmin', '123456', {
  host: 'localhost',
  dialect: 'mysql',
  timezone: '-03:00', 
  define: {
    timestamps: false
  },
  logging: false
});

export default sequelize;
