import { Sequelize } from 'sequelize';
import { defineModels } from '../db/models/index.js';

export const sequelize = new Sequelize({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'ia_db',
    dialect: 'postgres'
});

defineModels( sequelize )

sequelize.sync()

try{
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
} catch (error) {
    console.error('Unable to connect to the database:', error);
}
