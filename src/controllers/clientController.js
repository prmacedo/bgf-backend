const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cpfValidator = require('node-cpf');
const path = require('path');

const fastcsv = require("fast-csv");
const fs = require("fs");

const authMiddleware = require('../middlewares/auth');

const prisma = new PrismaClient();
const router = express.Router();
const ws = fs.createWriteStream("data.csv");

router.use(authMiddleware);

router.get('/clients', async (req, res) => {
  try {
    const clientList = await prisma.client.findMany({
      include: {
        partner: true,
        project: true,
        _count: {
          select: { attachments: true }
        }       
      }
    });

    clientList.map(client => (
      client.cpf = cpfValidator.mask(client.cpf)
    ))

    clientList.map(client => {
      if (client.partner) {
        return client.partner.cpf = cpfValidator.mask(client.partner.cpf)
      }
    })
    
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
        project: true,
        _count: {
          select: { attachments: true }
        } 
      }
    });

    client.cpf = cpfValidator.mask(client.cpf)
    
    if (client.partner) {
      client.partner.cpf = cpfValidator.mask(client.partner.cpf)   
    }

    return res.send(client)
  } catch (error) {
    return res.send({ error: error.message });
  }
});

router.get('/clients/:filter', async (req, res) => {
  const { filter } = req.params;

  try {
    const clients = await prisma.client.findMany({
      where: {
        OR: [
          {
            name: {
              contains: filter,
              mode: 'insensitive'
            }
          },
          {
            project: {
              name: {
                contains: filter,
                mode: 'insensitive'
              }
            }
          }
        ],
      },
      include: {
        project: true,
        _count: {
          select: { attachments: true }
        } 
      }
    });

    return res.send(clients);
  } catch (error) {
    return res.send({ error: error.message })
  }
});

router.get('/clients/:name/:project/:status', async (req, res) => {
  const { name, project, status } = req.params;
  
  let arrayToSearch = [];

  if (name !== 'undefined') {
    const nameFilterObj = {
      name: {
        contains: name,
        mode: 'insensitive'
      }
    }
    arrayToSearch.push(nameFilterObj)
  }

  if (project !== 'undefined') {
    const projectFilterObj = {
      project: {
        id: {
          equals: Number(project)
        }
      }
    }
    arrayToSearch.push(projectFilterObj)
  }

  if (status !== 'undefined') {
    const statusFilterObj = {
      status: {
        contains: status,
        mode: 'insensitive'
      }
    }
    arrayToSearch.push(statusFilterObj)
  }

  try {
    const clients = await prisma.client.findMany({
      where: {
        AND: arrayToSearch,
      },
      include: {
        project: true
      }
    });

    return res.send(clients)
  } catch (error) {
    return res.send({ error: error.message })
  }
});

router.get('/export/csv', async (req, res) => {  
  try {
    const clientList = await prisma.client.findMany({
      include: {        
        project: true
      }
    });

    clientList.map(client => (
      client.cpf = cpfValidator.mask(client.cpf)
    ))
    
    clientList.map(client => (
      client.project = client.project.name,
      client.partnerId = undefined,
      client.projectId = undefined
    ))
  
    fastcsv
      .write(clientList, { headers: true })
      .on("finish", function () {
        console.log("Write to CSV successfully!");
      })
      .pipe(ws);

    const filePath = path.join(__dirname, "../", "../", "data.csv");

    console.log(filePath)

    res.contentType("text/csv")

    return res.download(filePath, "data.csv", (err) => {
      if (err)
        console.log(err)

      console.log("ok");
    });
  } catch (error) {
    return res.send({ error: error.message });
  }
  

})

router.post('/client', async (req, res) => {
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