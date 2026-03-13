const express = require("express");
const app = express();
const cors = require("cors");

const {
  registrarUsuario,
  obtenerUsuario,
  loginUsuario,
  obtenerUsuarioPorEmail,
} = require("./consultas");

const {
  verificarCredencialesMiddleware,
  validarTokenMiddleware,
  loggerMiddleware,
} = require("./middleware");

app.listen(3000, console.log("SERVER ON"));
app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);

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

app.post("/login", verificarCredencialesMiddleware, async (req, res) => {
  try {
    const { email, password } = req.body;
    //obtiene el token desde DB
    const token = await loginUsuario(email, password);
    res.send({ token });
  } catch (error) {
    console.log(error);
    res.status(error.code || 500).send(error.message || "Error en el servidor");
  }
});

//obtener usuario con la ruta GET /usuarios/:id = ok
app.get("/usuarios", validarTokenMiddleware, async (req, res) => {
  try {
    const usuario = await obtenerUsuarioPorEmail(req?.email);
    delete usuario.password;
    res.json([usuario]);
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    res.status(error.code || 500).send(error.message || "Error en el servidor");
  }
});
