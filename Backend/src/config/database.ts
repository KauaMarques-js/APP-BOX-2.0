import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database/banco.db');

export default db;
