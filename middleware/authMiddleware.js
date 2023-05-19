const jwt = require('jsonwebtoken');
const generateToken = require('../utils/generateToken');

// const createJWT = (req, res) => {
//   const user = req.body;
//   // console.log(user);
//   //  const token = jwt.sign(payload/data,_SECRET/ pryvet key , expires

//   // const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
//   //   expiresIn: '1h',
//   // });
//   const token = generateToken();
//   // console.log(token);
//   res.send({ token });
// };

const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  // console.log(authorization);
  if (!authorization) {
    return res
      .status(401)
      .send({ error: true, message: 'unauthorized access' });
  }
  const token = authorization.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .send({ error: true, message: 'unauthorized access' });
    }
    req.decoded = decoded;
    next();
  });
};

module.exports = { createJWT, verifyJWT };
