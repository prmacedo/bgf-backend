const express = require('express');
const cors = require('cors');
//const path = require('path');

const app = express();

app.use(cors());

app.use(express.static("public"));
//app.use("/file", express.static(path.resolve(__dirname, "..", "tmp", "attachment")));
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
require('./controllers/attachmentController')(app);

app.listen(process.env.PORT, () => {
  console.log('Servidor rodando!');
});