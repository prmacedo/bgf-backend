const express = require('express');
const { PrismaClient } = require('@prisma/client');

const authMiddleware = require('../middlewares/auth');

const prisma = new PrismaClient();
const router = express.Router();

router.use(authMiddleware);

router.get('/admins', async (req, res) => {
  try {
    const admins = await prisma.adminitrator.findMany({
      orderBy: [
        {
          name: 'asc'
        }
      ]
    });

    return res.send(admins);
  } catch (error) {
    return res.send({ error: error.message });
  }
});

router.get('/admin/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const admin = await prisma.adminitrator.findUnique({
      where: {
        id: Number(id)
      }
    });

    return res.send(admin);
  } catch (error) {
    return res.send({ error: error.message });
  }
});

router.post('/admin', async (req, res) => {
  const {
    name,
    cnpj,
    cep,
    street,
    city,
    uf,
    district,
    complement
  } = req.body;

  try {
    const admin = await prisma.adminitrator.create({
      data: {
        name,
        cnpj,
        cep,
        street,
        city,
        uf,
        district,
        complement
      }
    });

    return res.send(admin);
  } catch (error) {
    return res.send({ error: error.message });
  }
});

router.patch('/admin/:id', async (req, res) => {
  const { id } = req.params;

  const {
    name,
    cnpj,
    cep,
    street,
    city,
    uf,
    district,
    complement
  } = req.body;

  try {
    const admin = await prisma.adminitrator.update({
      where: {
        id: Number(id)
      },
      data: {
        name,
        cnpj,
        cep,
        street,
        city,
        uf,
        district,
        complement
      }
    });

    return res.send(admin);
  } catch (error) {
    return res.send({ error: error.message });
  }
});

router.delete('/admin/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const admin = await prisma.adminitrator.delete({
      where: {
        id: Number(id)
      }
    });

    return res.send(admin);
  } catch (error) {
    return res.send({ error: error.message });
  }
});

module.exports = app => app.use('/', router);