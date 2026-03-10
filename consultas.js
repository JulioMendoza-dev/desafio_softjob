const { Pool } = require("pg");
const jwt = require("jsonwebtoken");

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "postgres",
  database: "softjobs",
  allowExitOnIdle: true,
});

//Registrar y obtener usuarios de la base                                                                        de dato

//Permitir el registro de nuevos usuarios a través de una ruta POST /usuarios
const registrarUsuario = async (email, password, rol, lenguage) => {
  try {
    const saltRounds = 10; // número de rondas de encriptación
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const consulta = `INSERT INTO usuarios (email, password, rol, lenguage) VALUES ($1, $2, $3, $4)`;
    const values = [email, hashedPassword, rol, lenguage];
    await pool.query(consulta, values);
    console.log("se registro usuario con exito, email: ", email);
    return { email };
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    throw { code: 500, message: "Error al registrar usuario" };
  }
};
//Login de usuario con la ruta POST /login
const loginUsuario = async (email, password) => {
  const consulta = `SELECT * from usuarios WHERE email = $1 AND password = $2`;
  const values = [email, password];
  const { rowCount } = await pool.query(consulta, values);
  if (!rowCount)
    throw {
      code: 404,
      message: "Credenciales incorrectas",
    };
  const token = jwt.sign({ email }, "secreto");
  return token;
};

/*Disponibilizar una ruta GET /usuarios para devolver los datos de un usuario en caso
de que esté autenticado, para esto:
○ Extraiga un token disponible en la propiedad Authorization de las cabeceras
○ Verifique la validez del token usando la misma llave secreta usada en su firma
○ Decodifique el token para obtener el email del usuario a buscar en su payload
○ Obtenga y devuelva el registro del usuario
*/
const obtenerUsuario = async (id) => {
  const { rows: usuarios } = await pool.query(
    `SELECT * FROM usuarios WHERE id = $1`,
    [id],
  );
  return usuarios[0];
};

//Verificar credenciales de usuario con la ruta POST /login
const verificarCredenciales = async (email, password) => {
  const consulta = `SELECT * FROM usuarios WHERE email = $1`;
  const values = [email];
  const { rows } = await pool.query(consulta, values);

  if (!rows.length) {
    throw { code: 404, message: "Credenciales incorrectas" };
  }

  const usuario = rows[0];
  const passwordValida = await bcrypt.compare(password, usuario.password);

  if (!passwordValida) {
    throw { code: 404, message: "Credenciales incorrectas" };
  }
};

//Eliminar usuario con la ruta DELETE /usuarios/:id
const eliminarUsuario = async (id) => {
  const consulta = `DELETE FROM usuarios WHERE id = $1`;
  await pool.query(consulta, [id]);
};

//Actualizar usuario con la ruta PUT /usuarios/:id
const actualizarUsuario = async (id, email, password, rol, lenguage) => {
  const consulta = `UPDATE usuarios SET email = $1, password = $2, rol = $3, lenguage = $4 WHERE id = $5`;
  const values = [email, password, rol, lenguage, id];
  const { rowCount } = await pool.query(consulta, values);

  if (!rowCount) {
    throw { code: 404, message: "Usuario no encontrado" };
  }
};

// Middleware para verificar credenciales
const verificarCredencialesMiddleware = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Faltan credenciales");
  }
  next();
};

const validarTokenMiddleware = (req, res, next) => {
  try {
    const autorizacion = req.headers.authorization;
    if (!autorizacion) throw new Error("Token no proporcionado");

    const token = autorizacion.split("Bearer ")[1];
    const payload = jwt.verify(token, "secreto");
    req.email = payload.email; // guardar email en req
    next();
  } catch (error) {
    res.status(401).send("Token inválido");
  }
};

//Middleware global para loguear todas las consultas
const loggerMiddleware = (req, res, next) => {
  console.log(`${req.method} ${req.url} - Body:`, req.body);
  next();
};

module.exports = {
  registrarUsuario,
  loginUsuario,
  obtenerUsuario,
  verificarCredenciales,
  eliminarUsuario,
  actualizarUsuario,
  verificarCredencialesMiddleware,
  validarTokenMiddleware,
  loggerMiddleware,
};
