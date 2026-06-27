// Middleware de autorización por rol.
// Siempre se usa DESPUÉS de verifyToken — depende de que req.user ya exista.
// Diferencia clave: verifyToken responde "¿eres quién dices ser?" (autenticación)
//                   checkRole responde "¿tienes permiso para esto?" (autorización)
// Acepta los roles permitidos tanto como argumentos individuales como array:
//   checkRole('admin')            → OK
//   checkRole('admin', 'profesor')→ OK
//   checkRole(['admin'])          → OK (normalizado con .flat())
const checkRole = (...rolesPermitidos) => {
  // .flat() normaliza el caso en que se pase un array en lugar de strings sueltos.
  // Permite que ambas formas de llamada funcionen sin documentar restricciones de uso.
  const roles = rolesPermitidos.flat();

  // Retorna una función middleware — este es el patrón "middleware factory":
  // checkRole() se llama al definir la ruta, no en cada petición.
  // La función interna sí se ejecuta en cada petición.
  return (req, res, next) => {
    // Defensa en profundidad: si alguien usa checkRole sin verifyToken antes, atraparlo aquí.
    if (!req.user) {
      return res.status(401).json({ message: 'No autenticado' });
    }
    // 403 Forbidden — el usuario está autenticado pero no tiene el rol necesario.
    // Diferente al 401: el cliente NO debe reintentar con otro login, sino simplemente no tiene acceso.
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ message: 'Acceso denegado: rol insuficiente' });
    }
    next();
  };
};

module.exports = checkRole;
