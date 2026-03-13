const jwt = require("jsonwebtoken");

// Middleware para verificar credenciales
const verificarCredencialesMiddleware = (req, res, next) => {
  const { email, password } = req?.body;
  if (!email || !password) {
    return res.status(400).send("Faltan credenciales");
  }
  next();
};

// Middelware para validar tokens
const validarTokenMiddleware = (req, res, next) => {
  try {
    const autorizacion = req.headers.authorization;
    if (!autorizacion) throw new Error("Token no proporcionado");
    // Tal cual como te lo piden:
    const token = autorizacion.split("Bearer ")[1];
    // Verificamos el token
    const payload = jwt.verify(token, "secreto");
    // Guardamos el email para la siguiente función
    req.email = payload.email;
    next();
  } catch (error) {
    // Si falla el split o el verify, cae aquí
    console.log({ error });
    res.status(401).send("Token inválido");
  }
};

//Middleware global para loguear todas las consultas
const loggerMiddleware = (req, res, next) => {
  console.log(`${req.method} ${req.url} - Body:`, req.body);
  next();
};

module.exports = {
  verificarCredencialesMiddleware,
  validarTokenMiddleware,
  loggerMiddleware,
};
