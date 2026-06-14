# Guía de Despliegue en Producción
## USF Portal — Universidad Santa Fe

---

## Arquitectura de Despliegue

```
Internet
   │
   ├── Frontend → Vercel (CDN global)
   │
   └── Backend  → Railway (Node.js managed)
                      │
                      └── MongoDB Atlas (DBaaS)
```

---

## 1. MongoDB Atlas (Base de Datos)

1. Crear cuenta en https://cloud.mongodb.com
2. Crear un nuevo proyecto: "usf-portal-prod"
3. **Build a Database** → seleccionar **M0 (Free Tier)**
4. Proveedor: AWS, región: us-east-1 (o la más cercana a México)
5. Crear usuario de base de datos:
   - Username: `usf_admin`
   - Password: Generar contraseña segura y guardarla
6. **Network Access** → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)
7. **Connect** → Connect your application → copiar la URI de conexión

La URI tendrá este formato:
```
mongodb+srv://usf_admin:<password>@cluster0.xxxxx.mongodb.net/usf_portal?retryWrites=true&w=majority
```

---

## 2. Railway (Backend)

1. Crear cuenta en https://railway.app
2. **New Project** → **Deploy from GitHub repo**
3. Seleccionar el repositorio y la carpeta `usf-portal/backend`
4. En **Settings → Root Directory**: `/usf-portal/backend`
5. En **Variables** (Settings → Variables), agregar:

```
PORT=3000
MONGODB_URI=<pegar-aqui-tu-uri-de-mongodb-atlas>
JWT_SECRET=<generar-con-openssl-rand-base64-64>
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=<tu-google-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<tu-google-client-secret>
GOOGLE_CALLBACK_URL=https://tu-app.up.railway.app/api/auth/google/callback
FRONTEND_URL=https://usf-portal.vercel.app
NODE_ENV=production
```

6. Railway detecta automáticamente Node.js y usa `npm start`
7. Copiar la URL generada: `https://tu-app.up.railway.app`

---

## 3. Vercel (Frontend)

1. Crear cuenta en https://vercel.com
2. **New Project** → Import desde GitHub
3. Seleccionar el repositorio
4. **Framework Preset**: Angular
5. **Root Directory**: `usf-portal/frontend`
6. **Build Command**: `ng build --configuration production`
7. **Output Directory**: `dist/usf-portal-frontend/browser`
8. En **Environment Variables**, agregar:
```
ANGULAR_API_URL=https://tu-app.up.railway.app/api
```
9. Actualizar `src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://tu-app.up.railway.app/api',
};
```

---

## 4. Actualizar Google Cloud Console para Producción

1. Ir a https://console.cloud.google.com
2. Credenciales → editar el cliente OAuth
3. Agregar en **Orígenes JavaScript autorizados**:
   - `https://usf-portal.vercel.app`
4. Agregar en **URIs de redirección autorizados**:
   - `https://tu-app.up.railway.app/api/auth/google/callback`

---

## 5. Verificación Post-Despliegue

- [ ] MongoDB Atlas: cluster activo y accesible
- [ ] Railway: backend respondiendo en /api/auth/me
- [ ] Vercel: frontend cargando en la URL de Vercel
- [ ] OAuth: flujo completo de autenticación funciona en producción
- [ ] PDF: generación de kardex funciona en producción
