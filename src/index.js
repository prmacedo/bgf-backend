const express = require('express');
const cors = require('cors');

const app = express();

const corsOptions = {
  allowedHeaders: ['Authorization', 'Content-Type'],
  origin: true,
  methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE']
}

app.use(cors(corsOptions));

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.options('*', cors());

app.get('/', (req, res) => {
  res.send({ ok: true });
});

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