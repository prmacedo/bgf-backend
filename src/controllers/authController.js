const express = require('express');
const { PrismaClient } = require('@prisma/client');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authConfig = require('../config/auth.json');

const prisma = new PrismaClient();
const router = express.Router();

function generateToken(params = {}) {
  return jwt.sign(params, authConfig.secret, {
    expiresIn: 86400
  });
}

// router.post('/create', async(req, res) => {
//   const { name, telephone, email, type } = req.body;
  
//   try {
//     const alreadyExists = await prisma.user.findUnique({
//       where: {
//         email
//       }
//     });
    
//     if(alreadyExists){
//       return res.send({ error: 'User already exists' })
//     }    
    
//     const password = await bcrypt.hash(req.body.password, 10);

//     const user = await prisma.user.create({
//       data: {
//         name,
//         telephone,
//         email,
//         password,
//         type
//       }
//     });

//     user.password = undefined;

//     return res.send({
//       user,
//       token: generateToken({ 
//         id: user.id, 
//         name: user.name, 
//         email: user.email, 
//         type: user.type, 
//         telephone: user.telephone 
//       })
//     });
//   } catch (error) {
//     return res.send({ error: 'Registration failed' });
//   }
// });

router.post('/authenticate', async(req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await prisma.user.findUnique({
      where: {
        email
      }
    });

    if (!user) {
      return res.send({ error: 'User not found'});
    }

    if(!await bcrypt.compare(password, user.password)) {
      return res.send({ error: 'Invalid password' })
    }

    user.password = undefined;

    res.send({ 
      user, 
      token: generateToken({ 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        type: user.type, 
        telephone: user.telephone 
      })
    });

  } catch (error) {
    res.send({ error: error.message })
  }
});

module.exports = app => app.use('/', router);