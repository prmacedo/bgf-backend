const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cnpjValidator = require('node-cnpj');
const cpfValidator = require('node-cpf');

const authMiddleware = require('../middlewares/auth');

const prisma = new PrismaClient();
const router = express.Router();

router.use(authMiddleware);

router.get('/assignees', async (req, res) => {
  try {
    const assignees = await prisma.assignee.findMany({
      orderBy: [
        {
          name: 'asc'
        }
      ]
    }).finally(async () => {
      await prisma.$disconnect();
    });

    assignees.map(assignee => (
      assignee.cnpj = cnpjValidator.mask(assignee.cnpj),
      assignee.cpf = cpfValidator.mask(assignee.cpf)
    ));

    return res.send(assignees);
  } catch (error) {
    return res.send({ error: error.message });
  }
});

router.get('/assignees/:filter', async (req, res) => {
  const { filter } = req.params;

  const cnpjFilter = cnpjValidator.unMask(filter);

  try {
    const assignees = await prisma.assignee.findMany({where: {
        OR: [
          {
            name: {
              contains: filter,
              mode: 'insensitive'
            }
          },
          {
            cnpj: {
              contains: cnpjFilter
            }
          }
        ]
      },
      orderBy: [
        {
          name: 'asc'
        }
      ]
    }).finally(async () => {
      await prisma.$disconnect();
    });

    assignees.map(assignee => (
      assignee.cnpj = cnpjValidator.mask(assignee.cnpj),
      assignee.cpf = cpfValidator.mask(assignee.cpf)
    ));

    return res.send(assignees);
  } catch (error) {
    return res.send({ error: error.message });
  }
});

router.get('/assignee/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const assignee = await prisma.assignee.findUnique({
      include: {
        admin: true
      },
      where:{
        id: Number(id)
      }
    }).finally(async () => {
      await prisma.$disconnect();
    });
    
    if (assignee.type === 1) {
      assignee.cnpj = cnpjValidator.mask(assignee.cnpj)
      assignee.admin.cnpj = cnpjValidator.mask(assignee.admin.cnpj)      
    } else {
      assignee.cpf = cpfValidator.mask(assignee.cpf)
    }


    return res.send(assignee);
  } catch (error) {
    return res.send({ error: error.message });
  }
});

router.post('/assignee', async (req, res) => {
  const {
    name,
    email,    
    telephone,
    cep,
    street,
    city,
    uf,
    district,
    complement
  } = req.body;

  const type = Number(req.body.type)

  const cpf = req.body.cpf ? cpfValidator.unMask(req.body.cpf) : null;
  const cnpj = req.body.cnpj ? cnpjValidator.unMask(req.body.cnpj) : null;

  if ((cnpj != null) && !cnpjValidator.validate(cnpj)) {
    return res.status(422).send({ error: 'Invalid CNPJ' })
  }

  if ((cpf != null) && !cpfValidator.validate(cpf)) {
    return res.status(422).send({ error: 'Invalid CPF' })
  }

  let data;

  if(type === 1) {
    data = {
      name,
      cnpj,
      type,
      email,
      telephone,
      cep,
      street,
      city,
      uf,
      district,
      complement
    }
  } else {
    data = {
      name,
      cpf,
      type,
      email,
      telephone,
      cep,
      street,
      city,
      uf,
      district,
      complement
    }
  }

  try {
    const assignee = await prisma.assignee.create({data})
    .finally(async () => {
      await prisma.$disconnect();
    });

    return res.send(assignee);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

router.patch('/assignee/:id', async (req, res) => {
  const { id } = req.params;
  
  const {
    name,
    email,
    telephone,
    cep,
    street,
    city,
    type,
    uf,
    district,
    complement,    
  } = req.body;

  const cnpj = cnpjValidator.unMask(req.body.cnpj);
  const cpf = cpfValidator.mask(req.body.cpf)

  if (type === 1 && !cnpjValidator.validate(cnpj)) {
    return res.status(422).send({ error: 'Invalid CNPJ'})
  }

  if (type === 2 && !cpfValidator.validate(cpf)) {
    return res.status(422).send({ error: 'Invalid CPF'})
  }

  try {
    const assignee = await prisma.assignee.update({
      where: {
        id: Number(id)
      },
      data: {
        name,
        cnpj,
        cpf,
        type,
        email,
        telephone,
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

    return res.send(assignee);
  } catch (error) {
    return res.send({ error: error.message });
  }
});

router.delete('/assignee/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const assignee = await prisma.assignee.delete({
      where:{
        id: Number(id)
      }
    }).finally(async () => {
      await prisma.$disconnect();
    });

    return res.send(assignee);
  } catch (error) {
    return res.send({ error: error.message });
  }
});

module.exports = app => app.use('/', router);