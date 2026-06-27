// Middleware de autenticación JWT.
// Verifica la firma del token en el header Authorization: Bearer <token>
// y agrega req.user = { id, rol, nombre } para uso en los controladores.
// Se ejecuta ANTES del controller en cualquier ruta protegida — si falla, la cadena se corta.
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];         // "Bearer eyJhbGci..."
  const token = authHeader && authHeader.split(' ')[1];   // extrae solo la parte después de "Bearer "

  // 401 Unauthorized — el cliente no mandó credenciales (falta el header o está vacío)
  if (!token) return res.status(401).json({ message: 'Token requerido' });

  try {
    // jwt.verify() hace dos cosas a la vez:
    // 1) Verifica que la firma sea válida (creada con nuestro JWT_SECRET)
    // 2) Verifica que el token no haya expirado (campo 'exp' en el payload)
    // Si cualquiera falla, lanza una excepción y cae al catch.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // req.user queda disponible para todos los middleware y controllers que siguen en la cadena.
    // Contiene: { id, rol, nombre, iat (emitido en), exp (expira en) }
    req.user = decoded;
    next(); // pasar al siguiente middleware o al controller
  } catch (err) {
    // 401 — token manipulado, firmado con otro secret, o ya expiró
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

module.exports = verifyToken;
