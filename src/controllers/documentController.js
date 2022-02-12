const express = require('express');
const { PrismaClient } = require('@prisma/client');

const authMiddleware = require('../middlewares/auth');

const prisma = new PrismaClient();
const router = express.Router();

router.use(authMiddleware);

router.get('/document/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const document = await prisma.document.findUnique({
      include: {
        client: true,
        assignee: true
      },
      where: {
        id: Number(id)
      }
    });

    return res.send(document)
  } catch (error) {
    return res.send({ error: error.message });
  }
});

router.get('/contract/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const document = await prisma.document.findUnique({
      include: {
        client: {
          include: {
            partner: true
          }
        },
        assignee: {
          include: {
            admin: true
          }
        }
      },
      where: {
        id: Number(id)
      }
    });

    return res.send(document)
  } catch (error) {
    return res.send({ error: error.message });
  }
});

router.get('/proposal/byUser/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const document = await prisma.document.findMany({      
      where: {
        clientId: Number(id)
      }
    });

    return res.send(document)
  } catch (error) {
    return res.send({ error: error.message });
  }
});

router.get('/contract/byUser/:id/', async (req, res) => {
  const { id } = req.params;
  
  try {
    const document = await prisma.document.findMany({
      where: {        
        AND: [
          {
            contractDate: {
              not: null
            },
            clientId: Number(id)
          }
        ]
      }
    });

    return res.send(document)
  } catch (error) {
    return res.send({ error: error.message });
  }
});

router.post('/document', async (req, res) => {
  const {
    type,
    precatory,
    process,
    court,
    value,
    correction,
    fee,
    preference,
    taxes,
    percentage,
    updatedValue,
    liquidValue,
    proposalValue,
    entity,
    farmCourt,
    precatoryValue,
    attorneyFee,
    place,
    proposalDate,
    contractDate,
    clientId,
    assigneeId
  } = req.body;

  try {
    const document = await prisma.document.create({
      data: {
        type,
        precatory,
        process,
        court,
        value,
        correction,
        fee,
        preference,
        taxes,
        percentage,
        updatedValue,
        liquidValue,
        proposalValue,
        entity,
        farmCourt,
        precatoryValue,
        attorneyFee,
        place,
        proposalDate,
        contractDate,
        client: {
          connect: { id: clientId }
        },
        assignee: {
          connect: { id: assigneeId }
        }
      }
    });

    return res.send(document)
  } catch (error) {
    return res.send({ error: error.message });
  }
});

router.patch('/document/:id', async (req, res) => {
  const { id } = req.params;

  const {
    type,
    precatory,
    process,
    court,
    value,
    correction,
    fee,
    preference,
    taxes,
    percentage,
    updatedValue,
    liquidValue,
    proposalValue,
    entity,
    farmCourt,
    precatoryValue,
    attorneyFee,
    place,
    proposalDate,
    contractDate,
    clientId,
    assigneeId
  } = req.body;

  try {
    const document = await prisma.document.update({
      where: {
        id: Number(id)
      },
      data: {
        type,
        precatory,
        process,
        court,
        value,
        correction,
        fee,
        preference,
        taxes,
        percentage,
        updatedValue,
        liquidValue,
        proposalValue,
        entity,
        farmCourt,
        precatoryValue,
        attorneyFee,
        place,
        proposalDate,
        contractDate,
        clientId,
        assigneeId
      }
    });

    return res.send(document);
  } catch (error) {
    return res.send({ error: error.message });
  }
});

router.delete('/document/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const document = await prisma.document.delete({
      where: {
        id: Number(id)
      }
    });

    return res.send(document);
  } catch (error) {
    return res.send({ error: error.message });
  }
});

module.exports = app => app.use('/', router);