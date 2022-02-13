const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth.json');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) { 
    return res.status(401).send({ error: 'No token provided' });
  }

  const parts = authHeader.split(' ');

  if (!parts.length === 2) {
    return res.status(401).send({ error: 'Token error' });    
  }

  const [ scheme, token ] = parts;

  if(!/^Bearer$/i.test(scheme)){
    return res.status(401).send({ error: 'Token malformatted' });    
  }

  jwt.verify(token, authConfig.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ error: 'Invalid token'})
    }

    const user = {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      telephone: decoded.telephone,
      type: decoded.type,
    }

    req.user = user;
    
    return next();
  });

}