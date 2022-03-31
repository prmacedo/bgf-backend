const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cnpjValidator = require('node-cnpj');

const authMiddleware = require('../middlewares/auth');

const prisma = new PrismaClient();
const router = express.Router();

router.use(authMiddleware);

router.get('/admins', async (req, res) => {
  try {
    const admins = await prisma.administrator.findMany({
      orderBy: [
        {
          name: 'asc'
        }
      ]
    }).finally(async () => {
      await prisma.$disconnect();
    });

    admins.map(admin => (
      admin.cnpj = cnpjValidator.mask(admin.cnpj)
    ))

    return res.send(admins);
  } catch (error) {
    return res.send({ error: error.message });
  }
});

router.get('/admin/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const admin = await prisma.administrator.findUnique({
      where: {
        id: Number(id)
      }
    }).finally(async () => {
      await prisma.$disconnect();
    });

    admin.cnpj = cnpjValidator.mask(admin.cnpj);

    return res.send(admin);
  } catch (error) {
    return res.send({ error: error.message });
  }
});

router.post('/admin', async (req, res) => {
  const {
    name,
    cep,
    street,
    city,
    uf,
    district,
    complement
  } = req.body;

  const cnpj = cnpjValidator.unMask(req.body.cnpj);

  if (!cnpjValidator.validate(cnpj)) {
    return res.status(422).send({ error: 'Invalid CNPJ'})
  }

  try {
    const admin = await prisma.administrator.create({
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
    }).finally(async () => {
      await prisma.$disconnect();
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
    cep,
    street,
    city,
    uf,
    district,
    complement
  } = req.body;

  const cnpj = cnpjValidator.unMask(req.body.cnpj);

  if (!cnpjValidator.validate(cnpj)) {
    return res.status(422).send({ error: 'Invalid CNPJ' })
  }

  try {
    const admin = await prisma.administrator.update({
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
    }).finally(async () => {
      await prisma.$disconnect();
    });

    return res.send(admin);
  } catch (error) {
    return res.send({ error: error.message });
  }
});

router.delete('/admin/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const admin = await prisma.administrator.delete({
      where: {
        id: Number(id)
      }
    }).finally(async () => {
      await prisma.$disconnect();
    });

    return res.send(admin);
  } catch (error) {
    return res.send({ error: error.message });
  }
});

module.exports = app => app.use('/', router);