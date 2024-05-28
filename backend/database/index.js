require("dotenv").config()

const {Pool} = require('pg')

const pool = new Pool({
    host: "localhost",
    user: "admin",
    password: "admin123",
    database: "softjobs",
    allowExitOnIdle: true
    });
    
module.exports = {pool};


    
