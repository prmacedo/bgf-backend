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
    }).finally(async () => {
      await prisma.$disconnect();
    });

    
    if (!user) {
      return res.status(422).send({ error: 'User not found'});
    }

    if (!user.active) {
      return res.status(403).send({ error: 'User inactive' })
    }

    if(!await bcrypt.compare(password, user.password)) {
      return res.status(422).send({ error: 'Invalid password' })
    }

    user.password = undefined;

    res.status(200).send({ 
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
    res.status(400).send({ error: error.message })
  }
});

module.exports = app => app.use('/', router);