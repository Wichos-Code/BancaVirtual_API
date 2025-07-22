export const handleErrors = (err, req, res, next) => {
  console.error(err);

  const statusCode = err.statusCode || 500;

  const message = err.message || 'Ocurrió un error interno en el servidor.';

  res.status(statusCode).json({
    success: false,
    message,
  });
};