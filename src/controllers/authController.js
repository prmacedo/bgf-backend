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

    if (!user.active) {
      return res.send({ error: 'User inactive' })
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