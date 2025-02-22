const express = require('express');
const cors = require('cors');
const {pool} = require('./database/index.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();

const key = "holasoyllave"

app.use(cors());
app.use (express.json());

const verifyToken = (req, res, next) => {
    const autorizacionHeader = req.headers['authorization'];
    if (!autorizacionHeader) {
        return res.status(401).json({ message: 'token no valido222' });
    }
    const [bearer, token] = autorizacionHeader.split(' ');

    if (bearer !== 'Bearer '|| !token) {
        return res.status(401).json({ message: 'token no valido333' });
    }
    try {
        jwt.verify(token, key) ; next();
    } catch (error) {
        console.log(error); 
        return res.status(401).json({ message: 'token no valido!!!' });
    }
}

app.post('/usuarios', async (req, res) => {
    try {
        const{email, password, rol, lenguage} = req.body;
        const query = 
        'INSERT INTO usuarios (id, email, password, rol, lenguage) VALUES (DEFAULT, $1, $2, $3, $4) RETURNING *;';
        const values = [email, bcrypt.hashSync(password), rol, lenguage];
        const { rows } = await pool.query(query, values);
        res.status(201).json({
            id: rows[0].id,
            email: rows[0].email,
        });
}
    catch (error) {
        console.log(error);
        res.status(500).json({ error: 'internal server error' });
    }
})  
app.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body;

        const query = 'SELECT * FROM usuarios WHERE email = $1';
        const values = [email];
        const { rows } = await pool.query(query, values);
        if (rows.length === 0) {
             res.status(404).json({ 
                message: 'usuario no encontrado',
                code: 404,
             });
}
        const user = rows[0];
        const verifyUser = bcrypt.compareSync(password, user.password);

        if (!verifyUser) {
            return res.status(401).json({
                message: 'contrasena incorrecta',
                code: 401,
            })
}
        
        const token = jwt.sign({
            email: user.email,
            rol: user.rol,
            lenguage: user.lenguage
        },
        key,
            );
        res.status(200).json ({message: "token", token});
 } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'internal server error' })
}
});

app.get("/usuarios", async (req, res) => {
   
    try {
        const [_,token] = req.headers.authorization.split(" ");
        const query = 'SELECT * FROM usuarios WHERE email = $1';
        const {email} = jwt.verify(token, key);

        const { rows } = await pool.query(query, [email]);
        const user = rows[0];

        if (!user) {
            return res
            .status(404)
            .json({ message: 'usuario no encontrado', code: 404 });
        }
        res.status(200).json([user]);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: 'internal server error' });
    }
})
app.listen(3000, () => {
    console.log('Server running on port 3000')
});
