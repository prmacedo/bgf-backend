const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const ejs = require('ejs')
const path = require('path')

const app = express();
const prisma = new PrismaClient();

const corsOptions = {
  allowedHeaders: ['Authorization', 'Content-Type', 'Content-Length'],
  origin: true,
  methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true
}

app.use(cors(corsOptions));

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.options('*', cors());

app.get('/', (req, res) => {
  res.send({ ok: true });
});

app.get('/generate/proposal/pdf/:id', async (request, response) => {
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

    const filePath = path.join(__dirname, "reports", "proposal.ejs")
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

require('./controllers/authController')(app);

require('./controllers/userController')(app);

require('./controllers/clientController')(app);
require('./controllers/partnerController')(app);

require('./controllers/assigneeController')(app);
require('./controllers/adminController')(app);

require('./controllers/projectController')(app);

require('./controllers/documentController')(app);

app.listen(process.env.PORT, () => {
  console.log('Servidor rodando!');
});