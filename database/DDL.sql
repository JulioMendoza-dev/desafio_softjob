  CREATE DATABASE softjobs;

  \c softjobs;

  CREATE TABLE usuarios (
    id        SERIAL        NOT NULL,
    email     VARCHAR(50)   NOT NULL  UNIQUE,
    password  VARCHAR(60)   NOT NULL,
    rol       VARCHAR(25)   NOT NULL,
    lenguage  VARCHAR(20)   NOT NULL,
    PRIMARY KEY (id)
  );

  iNSERT INTO usuarios (email, password, rol, lenguage) VALUES
  ('admin@softjobs.com', 'admin123', 'administrador', 'español'),
  ('usuario@softjobs.com', 'usuario123', 'usuario', 'español'),
  ('invitado@softjobs.com', 'invitado123', 'invitado', 'español'),
  ('test@softjobs.com', 'test123', 'test', 'ingles'),
  ('developer@softjobs.com', 'developer123', 'desarrollador', 'español'),
  ('analista@softjobs.com', 'analista123', 'analista', 'español'),
  ('supervisor@softjobs.com', 'supervisor123', 'supervisor', 'español'),
  ('cliente@softjobs.com', 'cliente123', 'cliente', 'ingles');