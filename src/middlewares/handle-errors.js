// En tu archivo ./handle-errors.js
export const handleErrors = (err, req, res, next) => {
    // Para depuración, puedes ver qué tipo de 'err' estás recibiendo
    console.error("Error capturado por handleErrors:", err);

    // Verifica si el error es un objeto de validación de express-validator
    if (err && err.array && typeof err.array === 'function') {
        // Es un objeto de validationResult de express-validator
        const validationErrors = err.array();
        return res.status(400).json({ // Usa 400 Bad Request para errores de validación
            success: false,
            message: "Errores de validación", // Mensaje general para el tipo de error
            errors: validationErrors.map(e => ({ // Mapea para obtener solo msg, o el objeto completo si lo prefieres
                path: e.path,
                msg: e.msg,
                value: e.value
            }))
            // O simplemente: errors: validationErrors, si quieres el objeto completo de express-validator
        });
    }

    // Si no es un error de validación, maneja como un error estándar
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Ocurrió un error interno en el servidor.';

    res.status(statusCode).json({
        success: false,
        message,
    });
};