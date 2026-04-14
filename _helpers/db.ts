import config from '../config.json';
import mysql from 'mysql2/promise';
import {Sequelize} from 'sequelize';
import accountModel from '../accounts/account.model';
import refreshTokenModel from '../accounts/refresh-token.model';


const db: any = {};
export default db;

initialize();

async function initialize(){
    const {host, port, user, password, database} = config.database;
    const connection = await mysql.createConnection({host, port, user, password});

    //create db if it doesnt exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);

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