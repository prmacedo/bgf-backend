const express = require('express');
const cors = require('cors');
//const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

const app = express();

app.use(cors());

app.use(express.static("public"));
//app.use("/file", express.static(path.resolve(__dirname, "..", "tmp", "attachment")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.send({ ok: true });
});

app.post('/firstuser', async (req, res) => {
  const { name, telephone, email, type } = req.body;

  try {
    const alreadyExists = await prisma.user.findUnique({
      where: {
        email
      }
    });

    if (alreadyExists) {
      return res.send({ error: 'User already exists' })
    }

    const password = await bcrypt.hash(process.env.DEFAULT_PASSWORD, 10);

    const user = await prisma.user.create({
      data: {
        name,
        telephone,
        email,
        password,
        type
      }
    }).finally(async () => {
      await prisma.$disconnect();
    });

    user.password = undefined;

    return res.send(user);
  } catch (error) {
    console.log(error);
    return res.send({ error: 'Registration failed' });
  }
});

require('./controllers/authController')(app);

require('./controllers/userController')(app);

require('./controllers/clientController')(app);
require('./controllers/partnerController')(app);

require('./controllers/assigneeController')(app);
require('./controllers/adminController')(app);

require('./controllers/projectController')(app);

require('./controllers/documentController')(app);
require('./controllers/attachmentController')(app);

app.listen(process.env.PORT, () => {
  console.log('Servidor rodando!');
});