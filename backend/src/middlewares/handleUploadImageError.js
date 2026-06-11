const multer = require('multer');

/** Maneja errores de multer en rutas de imagen de cosecha (US05). */
function handleUploadImageError(err, req, res, next) {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'La imagen no debe superar 5 MB.',
            });
        }
        return res.status(400).json({ message: err.message });
    }

    return res.status(400).json({
        message: err.message || 'Error al subir la imagen.',
    });
}

module.exports = handleUploadImageError;
