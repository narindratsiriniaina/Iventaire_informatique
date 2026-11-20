require('dotenv').config();

module.exports = {
  HOST: process.env.HOST || 'localhost',
  DATABASE: process.env.DATABASE || 'gestion_materiel',
  USER: process.env.USER || 'root',
  PASSWORD: process.env.PASSWORD || '',
  DIALECT: process.env.DIALECT || 'mysql',
  pool: {
    max: parseInt(process.env.MAX_POOL || 5),
    min: parseInt(process.env.MIN_POOL || 0),
    acquire: parseInt(process.env.ACQUIRE_POOL || 30000),
  }
};