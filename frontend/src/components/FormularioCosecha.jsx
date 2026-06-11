import React, { useState, useEffect } from 'react';
import { Camera, Calendar, Tag, AlertCircle, Upload } from 'lucide-react';
import axios from 'axios';
import ComparadorPrecioAbasto from './ComparadorPrecioAbasto';
import { validarFormularioCosecha, validarImagenCosecha } from '../utils/cosechaFormUtils';
import { diasHastaDisponibilidad } from '../utils/preventaUtils';

const FormularioCosecha = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    nombre_producto: '',
    categoria: '',
    descripcion: '',
    cantidad_disponible: '',
    unidad_medida: 'Quintal',
    precio_unitario: '',
    fecha_disponibilidad: new Date().toISOString().split('T')[0],
  });
  const [formErrors, setFormErrors] = useState({});
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [precioSugerido, setPrecioSugerido] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Efecto para consultar precio sugerido en el Mercado Abasto (US09)
  useEffect(() => {
    const fetchPrecioSugerido = async () => {
      if (formData.nombre_producto.length < 3) {
        setPrecioSugerido(null);
        return;
      }
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:5000/api/precios-abasto?producto=${formData.nombre_producto}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPrecioSugerido(response.data);
      } catch (err) {
        setPrecioSugerido(null); // Si no hay precio, ocultamos el badge silenciosamente
      }
    };

    const debounceTimer = setTimeout(fetchPrecioSugerido, 500);
    return () => clearTimeout(debounceTimer);
  }, [formData.nombre_producto]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const imgError = validarImagenCosecha(file);
    if (imgError) {
      setFormErrors((prev) => ({ ...prev, foto: imgError }));
      setFoto(null);
      setFotoPreview(null);
      return;
    }
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next.foto;
      return next;
    });
    setFoto(file);
    setFotoPreview(URL.createObjectURL(file));
  };

  // Lógica para determinar si es Preventa o Stock Inmediato (US06)
  const isPreventa = () => {
    const hoy = new Date().toISOString().split('T')[0];
    return formData.fecha_disponibilidad > hoy;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const errors = validarFormularioCosecha(formData, foto);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setError('Completa los campos obligatorios antes de publicar.');
      return;
    }
    setFormErrors({});
    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append('nombre_producto', formData.nombre_producto.trim());
      data.append('categoria', formData.categoria);
      data.append('descripcion', formData.descripcion.trim());
      data.append('cantidad_disponible', formData.cantidad_disponible);
      data.append('unidad_medida', formData.unidad_medida);
      data.append('precio_unitario', formData.precio_unitario);
      data.append('fecha_disponibilidad', formData.fecha_disponibilidad);
      data.append('foto', foto);

      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/cosechas', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      if (onSuccess) onSuccess();
      
      // Reiniciar formulario
      setFormData({
        nombre_producto: '',
        categoria: '',
        descripcion: '',
        cantidad_disponible: '',
        unidad_medida: 'Quintal',
        precio_unitario: '',
        fecha_disponibilidad: new Date().toISOString().split('T')[0],
      });
      setFoto(null);
      setFotoPreview(null);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Error al publicar la cosecha');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
      <div className="bg-emerald-600 px-6 py-4 border-b border-emerald-700">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Publicar Nueva Cosecha
        </h2>
        <p className="text-emerald-100 text-sm mt-1">Registra tus productos para ofrecerlos en el marketplace.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Columna Izquierda: Detalles Básicos */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto</label>
              <input
                type="text"
                name="nombre_producto"
                required
                value={formData.nombre_producto}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                placeholder="Ej. Achachairú fresco"
              />
              {precioSugerido && (
                <ComparadorPrecioAbasto
                  precioUsuario={formData.precio_unitario}
                  precioMercado={precioSugerido.precio_promedio_bs}
                  nombreProducto={precioSugerido.nombre_producto}
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select
                name="categoria"
                required
                value={formData.categoria}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="">Seleccionar...</option>
                <option value="Verduras">Verduras</option>
                <option value="Frutas">Frutas</option>
                <option value="Granos">Granos</option>
                <option value="Tubérculos">Tubérculos</option>
              </select>
              {formErrors.categoria && <p className="text-xs text-red-500 mt-1">{formErrors.categoria}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                name="descripcion"
                rows="3"
                required
                value={formData.descripcion}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none resize-none"
                placeholder="Detalles sobre calidad, variedad..."
              ></textarea>
              {formErrors.descripcion && <p className="text-xs text-red-500 mt-1">{formErrors.descripcion}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                <input
                  type="number"
                  name="cantidad_disponible"
                  required
                  min="0.01"
                  step="0.01"
                  value={formData.cantidad_disponible}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
                <select
                  name="unidad_medida"
                  value={formData.unidad_medida}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                >
                  <option value="Quintal">Quintal</option>
                  <option value="Arroba">Arroba</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio Unitario (Bs)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Tag className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="number"
                  name="precio_unitario"
                  required
                  min="0.01"
                  step="0.01"
                  value={formData.precio_unitario}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Columna Derecha: Foto y Disponibilidad */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fotografía</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-emerald-500 transition-colors bg-gray-50 group">
                <div className="space-y-1 text-center">
                  {fotoPreview ? (
                    <img src={fotoPreview} alt="Preview" className="mx-auto h-32 w-auto object-cover rounded-md shadow-sm" />
                  ) : (
                    <Camera className="mx-auto h-12 w-12 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                  )}
                  <div className="flex text-sm text-gray-600 justify-center mt-2">
                    <label htmlFor="foto-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-emerald-500 px-2 py-1 shadow-sm border border-gray-200">
                      <span>Subir archivo</span>
                      <input id="foto-upload" name="foto" type="file" className="sr-only" onChange={handleFileChange} accept="image/jpeg,image/png,image/webp" required={!fotoPreview} />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">JPG, PNG o WEBP — máx. 5 MB</p>
                  {formErrors.foto && <p className="text-xs text-red-500 mt-1">{formErrors.foto}</p>}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Fecha de disponibilidad *</label>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${isPreventa() ? 'bg-violet-100 text-violet-700' : 'bg-green-100 text-green-700'}`}>
                  {isPreventa() ? 'Preventa disponible' : 'Stock inmediato'}
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="date"
                  name="fecha_disponibilidad"
                  required
                  value={formData.fecha_disponibilidad}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>
              {isPreventa() && (
                <p className="text-xs text-violet-600 font-medium mt-1">
                  Disponible en {diasHastaDisponibilidad(formData.fecha_disponibilidad)} día(s)
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? 'Publicando...' : 'Publicar Cosecha en el Catálogo'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioCosecha;
