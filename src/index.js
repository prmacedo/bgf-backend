const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

app.listen(4000, () => {
  console.log('Servidor rodando na porta 4000');
});