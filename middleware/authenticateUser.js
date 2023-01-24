const jwt = require("jsonwebtoken");

// exports.authenticateToken = async (req, res, next) => {
//   const authHeader = req.headers["authorization"];
//   const token = authHeader && authHeader.split(" ")[1];
//   if (token == null) return res.status(401).send({setting:{success:"0",message:"Unauthorized request"}});
//   jwt.verify(token, "secretKey", (err, user) => {
//     if (err) {return res.status(403).send(err)};
//     req.user = user;
//   });
//   next();
// };

exports.authenticateToken =  (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    console.log(authHeader)
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null)
      return res
        .status(401)
        .send({ settings: { success: "0", message: "Unauthorized request" } });
    // (err, user) => {
    //   console.log(user);
    //   if (err) {return res.status(403).send(err)};

    //   req.user = user;
    // });
    const user =  jwt.verify(token, "secretKey");

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).send({ settings: { success: "0", message: "Token expired" } });
  }
};
