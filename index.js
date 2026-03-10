const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const {
  registrarUsuario,
  obtenerUsuario,
  verificarCredenciales,
  eliminarUsuario,
  actualizarUsuario,
  verificarCredencialesMiddleware,
  validarTokenMiddleware,
  loggerMiddleware,
} = require("./consultas");

app.listen(3000, console.log("SERVER ON"));
app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);

/*Usar middlewares para (2 puntos):
a. Verificar la existencia de credenciales en la ruta que corresponda
b. Validar el token recibido en las cabeceras en la ruta que corresponda
c. Reportar por la terminal las consultas recibidas en el servidor*/

app.checkServer = (req, res) => {
  console.log("servidor funcionando");
};

//Permitir el registro de nuevos usuarios a través de una ruta POST /usuarios
app.post("/usuarios", async (req, res) => {
  try {
    const { email, password, rol, lenguage } = req.body;
    await registrarUsuario(email, password, rol, lenguage);
    res.status(201).json({ message: "Usuario registrado con éxito" });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(error.code || 500).send(error.message || "Error en el servidor");
  }
});

/*Ofrecer la ruta POST /login que reciba las credenciales de un usuario y devuelva un
token generado con JWT. Se debe incluir el payload del token el email del usuario
registrado.*/
app.post("/login", verificarCredencialesMiddleware, async (req, res) => {
  try {
    const { email, password } = req.body;
    await verificarCredenciales(email, password);
    const token = jwt.sign({ email }, "secreto");
    res.json({ token });
  } catch (error) {
    console.log(error);
    res.status(error.code || 500).send(error.message || "Error en el servidor");
  }
});

//obtener usuario con la ruta GET /usuarios/:id = ok
app.get("/usuarios/:id", validarTokenMiddleware, async (req, res) => {
  try {
    const usuario = await obtenerUsuario(req.params.id);
    res.json(usuario);
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    res.status(error.code || 500).send(error.message || "Error en el servidor");
  }
});

//eliminar usuario con la ruta DELETE /usuarios/:id = ok
app.delete("/usuarios/:id", validarTokenMiddleware, async (req, res) => {
  try {
    const { id } = req.params; //Extraer el token de las cabeceras
    const Autorizacion = req.headers.authorization; //Verificar la validez del token usando la misma llave secreta usada en su firma
    const token = Autorizacion.split("Bearer ")[1]; //extrae del token el email del usuario a buscar en su payload
    jwt.verify(token, "secreto"); //verificar token con el mismo secreto usado para su firma
    const contenido_token = jwt.decode(token); //obtiene el contenido del token decodificado osea el email del usuario
    await eliminarUsuario(id); //elimina el usuario con el id especificado
    res.json({
      message: `El usuario ${contenido_token.email} ha eliminado al usuario ${id}`,
    });
    console.log(token);
  } catch (error) {
    //Reportar por la terminal las consultas recibidas en el servidor
    console.error("Error al eliminar usuario:", error);
    res.status(error.code || 500).send(error.message);
  }
});

//Actualizar usuario con la ruta PUT /usuarios/:id = ok
app.put("/usuarios/:id", validarTokenMiddleware, async (req, res) => {
  try {
    const { id } = req.params; //Extraer el token de las cabeceras
    const { email, password, rol, lenguage } = req.body; //Extraer el contenido del body para actualizar el usuario
    const Autorizacion = req.headers.authorization; //Verificar la validez del token usando la misma llave secreta usada en su firma
    const token = Autorizacion.split("Bearer ")[1]; //extrae del token el string bearer y obtiene el token en si
    jwt.verify(token, "secreto"); //verificar token con el mismo secreto usado para su firma
    await actualizarUsuario(id, email, password, rol, lenguage); //actualiza el usuario con el id especificado con el contenido del body
    const decode = jwt.decode(token); //obtiene el contenido del token decodificado osea el email del usuario

    res.status(200).send({
      message: `El usuario ${decode.email} ha actualizado al usuario ${id}`,
    }); //Reportar por la terminal las consultas recibidas en el servidor
    console.log(token);
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).send(error.message);
  }
});
