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
    }).finally(async () => {
      await prisma.$disconnect();
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
    }).finally(async () => {
      await prisma.$disconnect();
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
    }).finally(async () => {
      await prisma.$disconnect();
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
      return res.status(409).send({ error: 'User already exists' })
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
    }).finally(async () => {
      await prisma.$disconnect();
    });

    user.password = undefined;

    return res.status(201).send(user);
  } catch (error) {
    return res.status(400).send({ error: 'Registration failed' });
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

  const alreadyExists = await prisma.user.findUnique({
    where: {
      email
    }
  });

  if (alreadyExists.id !== Number(id)) {
    return res.status(409).send({ error: 'User already exists' })
  }

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
    }).finally(async () => {
      await prisma.$disconnect();
    });

    return res.send(user);
  } catch (error) {
    return res.status(400).send({ error: error.message });    
  }
});

router.patch('/user/active/:id', async (req, res) => {
  const { id } = req.params;
  const { active } = req.body;

  try {
    const user = await prisma.user.update({
      where: {
        id: Number(id)
      },
      data: {
        active
      }
    }).finally(async () => {
      await prisma.$disconnect();
    });

    return res.status(200).send(user);
  } catch (error) {
    return res.status(400).send({ error: error.message });    
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
    }).finally(async () => {
      await prisma.$disconnect();
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
    }).finally(async () => {
      await prisma.$disconnect();
    });

    return res.send(user);
  } catch (error) {
    return res.send({ error: error.message });
  }
});

module.exports = app => app.use('/', router);