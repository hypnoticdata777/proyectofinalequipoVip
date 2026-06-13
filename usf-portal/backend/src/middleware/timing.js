const timingMiddleware = (req, res, next) => {
  const inicio = Date.now();
  res.on('finish', () => {
    const duracion = Date.now() - inicio;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duracion}ms`);
    if (duracion > 500) {
      console.warn(`[TIMING] Respuesta lenta: ${req.method} ${req.originalUrl} tardó ${duracion}ms`);
    }
  });
  next();
};

module.exports = timingMiddleware;
