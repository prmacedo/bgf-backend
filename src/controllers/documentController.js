const express = require('express');
const { PrismaClient } = require('@prisma/client');
const ejs = require('ejs')
const path = require('path')
const puppeteer = require('puppeteer')
const extenso = require('extenso')
const cnpjValidator = require('node-cnpj');
const cpfValidator = require('node-cpf');


const authMiddleware = require('../middlewares/auth');

const ufs = require('../utils/ufs.json')
const maritalStatus = require('../utils/maritalStatus.json')

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
    }).finally(async () => {
      await prisma.$disconnect();
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
    }).finally(async () => {
      await prisma.$disconnect();
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
    }).finally(async () => {
      await prisma.$disconnect();
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
    }).finally(async () => {
      await prisma.$disconnect();
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
    }).finally(async () => {
      await prisma.$disconnect();
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
    }).finally(async () => {
      await prisma.$disconnect();
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
    }).finally(async () => {
      await prisma.$disconnect();
    });

    return res.send(document);
  } catch (error) {
    return res.send({ error: error.message });
  }
});

router.get('/download/proposal/pdf/:id', async (request, response) => {
  const { id } = request.params;

  const browser = await puppeteer.launch({ args: ['--no-sandbox'] })
  const page = await browser.newPage()

  page.setExtraHTTPHeaders({
    'authorization': request.headers.authorization,
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN_URL
  })

  const urlToDownload = `${process.env.APP_URL}/generate/proposal/pdf/${id}`;

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
    }).finally(async () => {
      await prisma.$disconnect();
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
    'authorization': request.headers.authorization,
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN_URL
  })

  const urlToDownload = `${process.env.APP_URL}/generate/contract/pdf/${id}`;

  await page.goto(urlToDownload, {
    waitUntil: 'networkidle0'
  })

  const name = 'Contrato.pdf'

  const pdf = await page.pdf({
    printBackground: true,
    format: 'Letter',
    path: "./src/contrato.pdf",
    margin: {
      top: '2.5cm',
      bottom: '2.5cm',
      left: '3cm',
      right: '3cm'
    }
    
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
        assignee: {
          include: {
            admin: true
          }
        }
      },
      where: {
        id: Number(id)
      }
    }).finally(async () => {
      await prisma.$disconnect();
    });

    const extensoOptions = { number: { decimal: 'informal' }}
    const formatNumber = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

    const client = {
      name: document.client.name,
      firstName: document.client.name.split(' ')[0],
      nationality: document.client.nationality,
      maritalStatus: maritalStatus.find(status => status.value === document.client.maritalStatus).label,
      profession: document.client.profession,
      rg: document.client.rg,
      cpf: cpfValidator.mask(document.client.cpf),
      fullAddress: `${document.client.street}, ${document.client.district}, ${document.client.city} - ${document.client.uf}, CEP ${document.client.cep}`,
      address: `${document.client.street}, ${document.client.district}`,
      cep: document.client.cep,
      city: document.client.city,
      uf: ufs.find(uf => uf.value === document.client.uf).label,
      telephone: document.client.telephone,
      email: document.client.email
    }

    const assignee = {
      name: document.assignee.name,
      cnpj: cnpjValidator.mask(document.assignee.cnpj),
      email: document.assignee.email,
      telephone: document.assignee.telephone,
      address: `${document.assignee.street}, ${document.assignee.district}`,
      cep: document.assignee.cep,
      city: document.assignee.city,
      uf: ufs.find(uf => uf.value === document.assignee.uf).label
    }
    
    const admin = {
      name: document.assignee.admin.name,
      cnpj: cnpjValidator.mask(document.assignee.admin.cnpj),
      address: `${document.assignee.admin.street}, ${document.assignee.admin.district}`,
      city: document.assignee.admin.city,
      uf: ufs.find(uf => uf.value === document.assignee.admin.uf).label
    };

    const contract = {
      type: document.type,
      process: document.process,
      entity: document.entity,
      precatory: document.precatory,
      farmCourt: document.farmCourt,
      precatoryValue: formatNumber.format(document.precatoryValue).split(" ")[1],
      precatoryValueString: extenso(document.precatoryValue, extensoOptions),
      percentage: document.percentage,
      percentageString: extenso(document.percentage, extensoOptions),
      date: (new Date(document.contractDate)).toLocaleDateString('pt-BR'),
      year: (new Date(document.contractDate)).getFullYear(),
      place: document.place
    }

    // console.log(document);
    
    // document.contractDate = (new Date(document.contractDate)).toLocaleDateString('pt-BR')
    // document.value = formatNumber.format(document.value).split(" ")[1]

    const filePath = path.join(__dirname, "../", "reports", "contract.ejs")
    ejs.renderFile(filePath, { contract, assignee, admin, client }, (err, html) => {
      if (err) {
        console.log(err);
        return response.send('Erro na leitura do arquivo');
      }

      // enviar para o navegador
      return response.send(html);
    })
  } catch (error) {
    return response.send({ error: error.message });
  }



})

module.exports = app => app.use('/', router);