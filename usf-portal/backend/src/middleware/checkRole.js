// Middleware de autorización por rol.
// Acepta los roles permitidos tanto como argumentos individuales como array:
//   checkRole('admin')            → OK
//   checkRole('admin', 'profesor')→ OK
//   checkRole(['admin'])          → OK (normalizado con .flat())
const checkRole = (...rolesPermitidos) => {
  const roles = rolesPermitidos.flat(); // Normaliza arrays anidados
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'No autenticado' });
    }
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ message: 'Acceso denegado: rol insuficiente' });
    }
    next();
  };
};

module.exports = checkRole;
