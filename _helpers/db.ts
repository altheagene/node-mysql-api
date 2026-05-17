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

    console.log(process.env.DB_HOST)
    console.log('=== DB CONNECTION DEBUG ===');
    console.log('Host:', host);
    console.log('Port:', port);
    console.log('User:', user);
    console.log('Database:', database);
    console.log('SSL:', ssl);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('==========================');
   

    if(process.env.NODE_ENV !== 'production') {
        
       try{
            const connection = await mysql.createConnection({host, port, user, password, ssl: ssl ? { rejectUnauthorized: false } : undefined});
            await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);

       }catch(err){
            console.error('Error connecting to DB with SSL in development:', err);
            throw err;
       }
    }
    
   
    //connect to db
    const sequelize = new Sequelize(database, user, password, {dialect : 'mysql', host: host, port: port, dialectOptions: ssl ? {
            ssl: {
                rejectUnauthorized: false
            }
        } : {}});

    //init models
    db.Account = accountModel(sequelize);
    db.RefreshToken = refreshTokenModel(sequelize);

    //define relationships
    db.Account.hasMany(db.RefreshToken, {onDelete: 'CASCADE'});
    db.RefreshToken.belongsTo(db.Account);

    //sync models with database
    await sequelize.sync();
}