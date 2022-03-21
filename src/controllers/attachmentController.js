const express = require('express');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const aws = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const multerConfig = require('../config/multer');

const prisma = new PrismaClient();
const router = express.Router();
const s3 = new aws.S3();

router.post("/attachment/:id", multer(multerConfig).single('file'), async (req, res) => {
  const { id } = req.params;
  const { originalname: name, size, key } = req.file;
  let { location: url = "" } = req.file;
  
  if (url === "") 
    url = `${process.env.APP_URL}/files/${key}`;

  const attachment = await prisma.attachment.create({
    data: {
      name,
      size,
      key,
      url,
      clientId: Number(id)
    }
  });

  console.log(req.file);
  return res.json(attachment);
});

router.delete("/attachment/:id", async (req, res) => {
  const { id } = req.params;

  const attachment = await prisma.attachment.delete({
    where: {
      id: Number(id)
    }
  });

  if (process.env.STORAGE_TYPE === 's3') {
    s3.deleteObject({
      Bucket: process.env.AWS_BUCKET,
      Key: attachment.key
    }).promise();

    return res.send({ok: true})
  } else {
    promisify(fs.unlink)(path.resolve(__dirname, '..', '..', 'tmp', 'attachment', attachment.key))
    return res.send({ok2: true})
  }
});

router.get("/attachment/:id", async (req, res) => {
  const { id } = req.params;
  const attachments = await prisma.attachment.findMany({
    where: {
      clientId: Number(id)
    }
  });

  res.send(attachments);
})

module.exports = app => app.use('/', router);
