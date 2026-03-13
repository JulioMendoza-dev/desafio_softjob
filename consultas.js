const { Pool } = require("pg");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

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
    const existeUsuario = await obtenerUsuarioPorEmail(email);
    if (existeUsuario) {
      throw { code: 400, message: "El usuario ya existe!" };
    }
    const saltRounds = 10; // número de rondas de encriptación
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const consulta = `INSERT INTO usuarios (email, password, rol, lenguage) VALUES ($1, $2, $3, $4)`;
    const values = [email, hashedPassword, rol, lenguage];
    await pool.query(consulta, values);
    console.log("se registro usuario con exito, email: ", email);
    return { email };
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    throw error;
  }
};

const loginUsuario = async (email, password) => {
  const usuario = await obtenerUsuarioPorEmail(email);
  if (!usuario) {
    throw { code: 400, message: "usuario no existe" };
  }
  //Comparamos la clave recibida con la encriptada de la DB
  // bcrypt.compare devuelve true o false
  const passwordEsCorrecta = await bcrypt.compare(password, usuario.password);
  if (!passwordEsCorrecta) {
    throw { code: 401, message: "Contraseña incorrecta" };
  }
  //Si todo está bien, generamos el token
  const token = jwt.sign({ email }, "secreto");
  return token;
};

//Obtener usuarios
const obtenerUsuarioPorEmail = async (email) => {
  const { rows: usuarios } = await pool.query(
    `SELECT * FROM usuarios WHERE email = $1`,
    [email],
  );
  return usuarios[0];
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

//Verificar credenciales de usuario con la ruta POST /login
const verificarCredenciales = async (email, password) => {
  const consulta = `SELECT * FROM usuarios WHERE email = $1`;
  const values = [email];
  //rows es el arreglo del objeto
  const { rows, rowCount } = await pool.query(consulta, values);
  //Si rowCount es 0, significa que el email no existe en la DB
  if (rowCount === 0) {
    throw { code: 404, message: "No hay usuario con estas credenciales" };
  }
  //Extraemos el usuario (el primer elemento del arreglo rows)
  const usuario = rows[0];
  //COMPARACIÓN: Usamos bcrypt para validar la contraseña
  const passwordValida = await bcrypt.compare(password, usuario.password);
  if (!passwordValida) {
    throw { code: 401, message: "Contraseña incorrecta" };
  }
  //Si todo está bien, retornamos el usuario (o sus datos básicos)
  return usuario;
};

module.exports = {
  registrarUsuario,
  loginUsuario,
  obtenerUsuarioPorEmail,
  verificarCredenciales,
  eliminarUsuario,
  actualizarUsuario,
};
