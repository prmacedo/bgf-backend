const express = require('express');
const { PrismaClient } = require('@prisma/client');
const ejs = require('ejs')
const path = require('path')
const puppeteer = require('puppeteer')

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

router.get('/download/proposal/pdf/:id', async (request, response) => {
  const { id } = request.params;

  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  page.setExtraHTTPHeaders({
    'authorization': request.headers.authorization,
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN_URL
  })

  const urlToDownload = `${process.env.SERVER_PDF_URL}/generate/proposal/pdf/${id}`;

  await page.goto(urlToDownload, {
    waitUntil: 'networkidle0'
  })

  const name = 'Proposta.pdf'

  const pdf = await page.pdf({
    printBackground: true,
    format: 'Letter',
    path: "./src/proposta.pdf"
  })

  await browser.close()

  response.contentType("application/pdf")
  
  const filePath = path.join(__dirname, "../", "proposta.pdf");

  // return response.send(pdf)

  return response.download(filePath, name, (err) => {
    if (err)
      console.log(err)
    
    console.log("ok");
  });
})

router.get('/generate/proposal/pdf/:id', async (request, response) => {
  const { id } = request.params;

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
  
    const formatNumber = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

    document.proposalDate = (new Date(document.proposalDate)).toLocaleDateString('pt-BR')
    
    document.value = formatNumber.format(document.value).split(" ")[1]
    document.correction = formatNumber.format(document.correction).split(" ")[1]
    document.fee = formatNumber.format(document.fee).split(" ")[1]
    document.preference = formatNumber.format(document.preference).split(" ")[1]
    document.taxes = formatNumber.format(document.taxes).split(" ")[1]
    document.percentage = formatNumber.format(document.percentage).split(" ")[1]
    document.updatedValue = formatNumber.format(document.updatedValue).split(" ")[1]
    document.liquidValue = formatNumber.format(document.liquidValue).split(" ")[1]
    document.proposalValue = formatNumber.format(document.proposalValue).split(" ")[1]

    const filePath = path.join(__dirname, "../", "reports", "proposal.ejs")
    ejs.renderFile(filePath, { document }, (err, html) => {
      if (err) {
        return response.send('Erro na leitura do arquivo')
      }

      // enviar para o navegador
      return response.send(html)
    })
  } catch (error) {
    return response.send({ error: error.message });
  }  
})

router.get('/download/contract/pdf/:id', async (request, response) => {
  const { id } = request.params;

  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  page.setExtraHTTPHeaders({
    'authorization': request.headers.authorization
  })

  const urlToDownload = `${process.env.SERVER_PDF_URL}/generate/proposal/pdf/${id}`;

  await page.goto(urlToDownload, {
    waitUntil: 'networkidle0'
  })

  const name = 'Contrato.pdf'

  const pdf = await page.pdf({
    printBackground: true,
    format: 'Letter',
    path: "./src/contrato.pdf"
  })

  await browser.close()

  response.contentType("application/pdf")

  const filePath = path.join(__dirname, "../", "contrato.pdf");

  // return response.send(pdf)

  return response.download(filePath, name, (err) => {
    if (err)
      console.log(err)

    console.log("ok");
  });
})

router.get('/generate/contract/pdf/:id', async (request, response) => {
  const { id } = request.params;

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

    const formatNumber = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

    document.contractDate = (new Date(document.contractDate)).toLocaleDateString('pt-BR')

    document.value = formatNumber.format(document.value).split(" ")[1]
    document.correction = formatNumber.format(document.correction).split(" ")[1]
    document.fee = formatNumber.format(document.fee).split(" ")[1]
    document.preference = formatNumber.format(document.preference).split(" ")[1]
    document.taxes = formatNumber.format(document.taxes).split(" ")[1]
    document.percentage = formatNumber.format(document.percentage).split(" ")[1]
    document.updatedValue = formatNumber.format(document.updatedValue).split(" ")[1]
    document.liquidValue = formatNumber.format(document.liquidValue).split(" ")[1]
    document.proposalValue = formatNumber.format(document.proposalValue).split(" ")[1]

    const filePath = path.join(__dirname, "../", "reports", "proposal.ejs")
    ejs.renderFile(filePath, { document }, (err, html) => {
      if (err) {
        return response.send('Erro na leitura do arquivo')
      }

      // enviar para o navegador
      return response.send(html)
    })
  } catch (error) {
    return response.send({ error: error.message });
  }



})

module.exports = app => app.use('/', router);