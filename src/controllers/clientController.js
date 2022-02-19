const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cpfValidator = require('node-cpf');

const authMiddleware = require('../middlewares/auth');

const prisma = new PrismaClient();
const router = express.Router();

router.use(authMiddleware);

router.get('/clients', async (req, res) => {
  try {
    const clientList = await prisma.client.findMany({
      include: {
        partner: true,
        project: true        
      }
    });

    clients.map(client => (
      client.cpf = cpfValidator.mask(client.cpf)
    ))
    
    return res.send(clientList);
  } catch (error) {
    return res.send({ error: error.message });
  }
});

router.get('/client/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const client = await prisma.client.findUnique({
      where: {
        id: Number(id)
      },
      include: {
        partner: true,
        project: true
      }
    });

    client.cpf = cpfValidator.mask(client.cpf)

    return res.send(client)
  } catch (error) {
    return res.send({ error: error.message });
  }
});

router.post('/client', async (req, res) => {
  const {
    name,
    nationality,
    gender,
    maritalStatus,
    profession,
    cpf,
    rg,
    email,
    telephone,
    cep,
    street,
    city,
    uf,
    district,
    complement,
    projectId,
    partnerId
  } = req.body;

  const cpf = cpfValidator.unMask(req.body.cpf);

  if (!cpfValidator.validate(cpf)) {
    return res.status(422).send({ error: 'Invalid CPF' })
  }

  try {
    const client = await prisma.client.create({
      data: {
        name,
        nationality,
        gender,
        maritalStatus,
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
        complement,
        project: {
          connect: { id: projectId }
        },
        partner: partnerId ? { connect: { id: partnerId } } : undefined
      }
    });

    return res.send(client)
  } catch (error) {
    return res.send({ error: error.message });
  }
});

router.patch('/client/:id', async (req, res) => {
  const { id } = req.params;
  
  const {
    name,
    nationality,
    gender,
    maritalStatus,
    profession,
    rg,
    email,
    telephone,
    cep,
    street,
    city,
    uf,
    district,
    complement,
    projectId,
    partnerId
  } = req.body;

  const cpf = cpfValidator.unMask(req.body.cpf);

  if (!cpfValidator.validate(cpf)) {
    return res.status(422).send({ error: 'Invalid CPF' })
  }

  try {
    const client = await prisma.client.update({
      where:{
        id: Number(id)
      },
      data: {
        name,
        nationality,
        gender,
        maritalStatus,
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
        complement,
        projectId,
        partnerId
      }
    });

    return res.send(client);
  } catch (error) {
    return res.send({ error: error.message });
  }
});

router.delete('/client/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const client = await prisma.client.delete({
      where: {
        id: Number(id)
      }
    });

    return res.send(client);
  } catch (error) {
    return res.send({ error: error.message });    
  }
});

module.exports = app => app.use('/', router);