const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cpfValidator = require('node-cpf');

const authMiddleware = require('../middlewares/auth');

const prisma = new PrismaClient();
const router = express.Router();

router.use(authMiddleware);

router.get('/partner/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const partner = await prisma.partner.findUnique({
      where: {
        id: Number(id)
      }
    }).finally(async () => {
      await prisma.$disconnect();
    });

    partner.cpf = cpfValidator.mask(partner.cpf)

    return res.send(partner)
  } catch (error) {
    return res.send({ error: error.message });
  }
});

router.post('/partner', async (req, res) => {
  const {
    name,
    nationality,
    gender,
    marriageRegime,
    profession,
    rg,
    email,
    telephone,
    cep,
    street,
    city,
    uf,
    district,
    complement
  } = req.body;

  const cpf = cpfValidator.unMask(req.body.cpf);

  if (!cpfValidator.validate(cpf)) {
    return res.status(422).send({ error: 'Invalid CPF' })
  }

  try {
    const partner = await prisma.partner.create({
      data: {
        name,
        nationality,
        gender,
        marriageRegime,
        profession,
        cpf,
        rg,
        email,
        telephone,
        cep,
        street,
        uf,
        city,
        district,
        complement
      }
    }).finally(async () => {
      await prisma.$disconnect();
    });

    return res.send(partner)
  } catch (error) {
    return res.send({ error: error.message });
  }
});

router.patch('/partner/:id', async (req, res) => {
  const { id } = req.params;

  const {
    name,
    nationality,
    gender,
    marriageRegime,
    profession,
    rg,
    email,
    telephone,
    cep,
    street,
    city,
    uf,
    district,
    complement
  } = req.body;

  const cpf = cpfValidator.unMask(req.body.cpf);

  if (!cpfValidator.validate(cpf)) {
    return res.status(422).send({ error: 'Invalid CPF' })
  }

  try {
    const partner = await prisma.partner.update({
      where: {
        id: Number(id)
      },
      data: {
        name,
        nationality,
        gender,
        marriageRegime,
        profession,
        cpf,
        rg,
        email,
        telephone,
        cep,
        street,
        uf,
        city,
        district,
        complement
      }
    }).finally(async () => {
      await prisma.$disconnect();
    });

    return res.send(partner);
  } catch (error) {
    return res.send({ error: error.message });
  }
});

router.delete('/partner/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const partner = await prisma.partner.delete({
      where: {
        id: Number(id)
      }
    }).finally(async () => {
      await prisma.$disconnect();
    });

    return res.send(partner);
  } catch (error) {
    return res.send({ error: error.message });
  }
});

module.exports = app => app.use('/', router);