# Guía de Instalación y Configuración Local
## USF Portal — Universidad Santa Fe

---

## Requisitos Previos

Asegúrate de tener instalado:

- **Node.js** 20 LTS o superior: https://nodejs.org
- **npm** 10+ (incluido con Node.js)
- **MongoDB** 7.0+ o acceso a MongoDB Atlas
- **Angular CLI** 17+: `npm install -g @angular/cli@17`
- **Git** para control de versiones

Verificar instalaciones:
```bash
node --version   # v20.x.x
npm --version    # 10.x.x
ng version       # Angular CLI: 17.x.x
mongod --version # db version v7.x.x
```

---

## 1. Clonar el Repositorio

```bash
git clone https://github.com/hypnoticdata777/proyectofinalequipovip.git
cd proyectofinalequipovip/usf-portal
```

---

## 2. Configurar Google OAuth en Google Cloud Console

1. Ve a https://console.cloud.google.com
2. Crea un nuevo proyecto: "USF Portal"
3. En el menú lateral, ve a **APIs y servicios > Credenciales**
4. Clic en **Crear credenciales > ID de cliente de OAuth**
5. Tipo de aplicación: **Aplicación web**
6. Nombre: "USF Portal Dev"
7. Orígenes de JavaScript autorizados: `http://localhost:4200`
8. URIs de redirección autorizados: `http://localhost:3000/api/auth/google/callback`
9. Clic en **Crear**
10. Copia el **Client ID** y **Client Secret**

---

## 3. Configurar el Backend

```bash
cd backend
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/usf_portal
JWT_SECRET=tu_clave_secreta_super_larga_minimo_64_caracteres_aqui
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=tu_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
FRONTEND_URL=http://localhost:4200
NODE_ENV=development
```

Instalar dependencias:

```bash
npm install
```

Iniciar el servidor de desarrollo:

```bash
npm run dev
# Servidor corriendo en http://localhost:3000
```

---

## 4. Configurar el Frontend

```bash
cd ../frontend
npm install
npm start
# Aplicación disponible en http://localhost:4200
```

---

## 5. Seeds de Datos de Prueba

Para poblar la base de datos con datos iniciales, crea y ejecuta este script:

```javascript
// backend/seeds/seed.js
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../src/models/User');
const Materia = require('../src/models/Materia');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  // Admin de prueba
  await User.create({
    googleId: 'admin-test-001',
    nombre: 'Administrador',
    apellido: 'Sistema',
    email: 'admin@utsf.edu.mx',
    rol: 'admin',
    matricula: 'ADM-001',
  });

  // Materias de ejemplo
  const materias = [
    {
      clave: 'MAT-101',
      nombre: 'Cálculo Diferencial',
      creditos: 6,
      cupoMaximo: 35,
      cupoDisponible: 35,
      periodo: '2026-1',
      horario: [
        { dia: 'Lunes', horaInicio: '07:00', horaFin: '09:00', salon: 'A-101' },
        { dia: 'Miércoles', horaInicio: '07:00', horaFin: '09:00', salon: 'A-101' },
      ],
    },
    {
      clave: 'INF-201',
      nombre: 'Programación Orientada a Objetos',
      creditos: 8,
      cupoMaximo: 30,
      cupoDisponible: 30,
      periodo: '2026-1',
      horario: [
        { dia: 'Martes', horaInicio: '09:00', horaFin: '11:00', salon: 'Lab-3' },
        { dia: 'Jueves', horaInicio: '09:00', horaFin: '11:00', salon: 'Lab-3' },
      ],
    },
    {
      clave: 'ESP-102',
      nombre: 'Taller de Comunicación',
      creditos: 4,
      cupoMaximo: 40,
      cupoDisponible: 40,
      periodo: '2026-1',
      horario: [
        { dia: 'Viernes', horaInicio: '11:00', horaFin: '13:00', salon: 'B-205' },
      ],
    },
  ];

  await Materia.insertMany(materias);
  console.log('Seed completado exitosamente.');
  process.exit(0);
};

seed().catch(console.error);
```

Ejecutar seed:
```bash
cd backend
node seeds/seed.js
```

---

## 6. Verificar que Todo Funciona

1. Backend corriendo en http://localhost:3000
2. Frontend corriendo en http://localhost:4200
3. MongoDB conectado (ver log del servidor)
4. Navegar a http://localhost:4200 → debe redirigir a `/auth/login`
5. Clic en "Iniciar sesión con Google"
6. Autenticar con cuenta Google
7. Verificar redirección al dashboard según rol
