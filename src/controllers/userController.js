const express = require('express');
const { PrismaClient } = require('@prisma/client');

const bcrypt = require('bcryptjs');

const authMiddleware = require('../middlewares/auth');

const prisma = new PrismaClient();
const router = express.Router();

router.use(authMiddleware);

router.get('/user/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: Number(id)
      }
    });

    user.password = undefined;

    return res.send(user);
  } catch (error) {
    return res.send({ error: error.message });
  }
})

router.get('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const users = await prisma.user.findMany({
      where: {
        id: {
          not: Number(id)
        }
      }
    });
    
    const formatedUsers = users.map((user) => {
      user.password = undefined;
      return user;
    });

    return res.send(formatedUsers);
  } catch (error) {
    return res.send({ error: error.message });
  }
});

router.get('/users/:id/:filter', async (req, res) => {
  const { id, filter } = req.params;

  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          {
            name: {
              contains: filter,
              mode: 'insensitive'
            }
          },
          {
            type: {
              equals: filter
            }
          }
        ],
        AND: [
          {
            id: {
              not: Number(id)
            }
          }
        ]
      }
    });

    const formatedUsers = users.map((user) => {
      user.password = undefined;
      return user;
    });

    return res.send(formatedUsers);
  } catch (error) {
    return res.send({ error: error.message });
  }
});

router.post('/user', async (req, res) => {
  const { name, telephone, email, type } = req.body;

  try {
    const alreadyExists = await prisma.user.findUnique({
      where: {
        email
      }
    });

    if (alreadyExists) {
      return res.send({ error: 'User already exists' })
    }

    const password = await bcrypt.hash(process.env.DEFAULT_PASSWORD, 10);

    const user = await prisma.user.create({
      data: {
        name,
        telephone,
        email,
        password,
        type
      }
    });

    user.password = undefined;

    return res.send(user);
  } catch (error) {
    return res.send({ error: 'Registration failed' });
  }
});

router.patch('/user/:id', async (req, res) => {
  const { id } = req.params;
  const {
    name,
    telephone,
    email,
    type,
    active
  } = req.body;

  try {
    const user = await prisma.user.update({
      where: {
        id: Number(id)
      },
      data: {
        name,
        telephone,
        email,
        type,
        active
      }
    });

    return res.send(user);
  } catch (error) {
    return res.send({ error: error.message });    
  }
});

router.patch('/user/password/:id', async (req, res) => {
  const { id } = req.params;
  const password = await bcrypt.hash(req.body.password, 10);

  try {
    const user = await prisma.user.update({
      where: {
        id: Number(id)
      },
      data: {
        password
      }
    });

    return res.send(user);
  } catch (error) {
    return res.send({ error: error.message });
  }
});

router.delete('/user/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.delete({
      where: {
        id: Number(id)
      }
    });

    return res.send(user);
  } catch (error) {
    return res.send({ error: error.message });
  }
});

module.exports = app => app.use('/', router);