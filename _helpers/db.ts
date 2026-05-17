import config from '../config.json';
import mysql from 'mysql2/promise';
import {Sequelize} from 'sequelize';
import accountModel from '../accounts/account.model';
import refreshTokenModel from '../accounts/refresh-token.model';
import {loadFileConfig, FileConfig} from '../_helpers/config-loader';

const fileConfig:FileConfig = process.env.NODE_ENV === 'production' ? {} : loadFileConfig();


const db: any = {};
export default db;

initialize();

async function initialize(){
    // const {host, port, user, password, database} = config.database;
    const host = process.env.DB_HOST || fileConfig.database.host;
    const port = Number(process.env.DB_PORT || fileConfig.database.port);
    const user = process.env.DB_USER || fileConfig.database.user;
    const password = process.env.DB_PASSWORD || fileConfig.database.password;
    const database = process.env.DB_NAME || fileConfig.database.database;
    const ssl = process.env.DB_SSL === 'true' || fileConfig.database?.ssl 
   

    if(process.env.NODE_ENV !== 'production') {
        
       try{
            const connection = await mysql.createConnection({host, port, user, password});
            await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);

       }catch(err){
            console.error('Error connecting to DB with SSL in development:', err);
            throw err;
       }
    }
    
   
    //connect to db
    const sequelize = new Sequelize(database, user, password, {dialect : 'mysql'});

    //init models
    db.Account = accountModel(sequelize);
    db.RefreshToken = refreshTokenModel(sequelize);

    //define relationships
    db.Account.hasMany(db.RefreshToken, {onDelete: 'CASCADE'});
    db.RefreshToken.belongsTo(db.Account);

    //sync models with database
    await sequelize.sync();
}