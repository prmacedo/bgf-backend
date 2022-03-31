const express = require('express');
const { PrismaClient } = require('@prisma/client');

const authMiddleware = require('../middlewares/auth');

const prisma = new PrismaClient();
const router = express.Router();

router.use(authMiddleware);

router.get('/projects', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: [
        {
          name: 'asc'
        }
      ]
    }).finally(async () => {
      await prisma.$disconnect();
    });

    return res.send(projects);
  } catch (error) {
    return res.send({ error: error.message });
  }
});

router.post('/project', async (req, res) => {
  const { name } = req.body;
  try {
    const project = await prisma.project.create({
      data: {
        name     
      }
    }).finally(async () => {
      await prisma.$disconnect();
    });

    return res.send(project);
  } catch (error) {
    return res.send({ error: error.message });
  }
});

module.exports = app => app.use('/', router);