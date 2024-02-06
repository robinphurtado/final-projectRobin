const mysql = require('mysql');

const pool = mysql.createPool({
  connectionLimit: 10,
  host: "yjo6uubt3u5c16az.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
  user: "h1jhq8bbvmf9lylo",
  password: "i23v9d1pvsvs1r1b",
  database: "nqt0s8xm0jrbo1tp"
});

module.exports = pool;
