import React from 'react';
import { Shield, ShieldAlert, Clock, Star, MapPin, Phone, Mail, TrendingUp, Award, MessageCircle } from 'lucide-react';

const ProducerProfile = ({ producer, products = [] }) => {
  if (!producer) return <div className="p-8 text-center text-gray-500">Cargando perfil...</div>;

  const getInitials = (name) => {
    if (!name) return 'PR';
    const parts = name.split(' ');
    return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
  };

  // Renderizar estrellas 1-5
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star key={i} className={`w-5 h-5 ${i <= Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
      );
    }
    return <div className="flex items-center gap-0.5">{stars}</div>;
  };

  // Determinar si es productor nuevo (sin calificaciones o sin ventas)
  const esProductorNuevo = !producer.calificacionPromedio || producer.calificacionPromedio === 0 || !producer.ventasCompletadas || producer.ventasCompletadas === 0;

  // Verificar estado (UPPERCASE del nuevo schema)
  const esPendiente = producer.estado === 'PENDIENTE_VERIFICACION';
  const esVerificado = producer.estado === 'VERIFICADO';
  const esRechazado = producer.estado === 'RECHAZADO';

  return (
    <div className="max-w-4xl mx-auto my-8">

      {/* ALERTA DE VERIFICACIÓN PENDIENTE (US03) */}
      {esPendiente &&
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r-lg shadow-sm flex items-start gap-3">
          <ShieldAlert className="w-7 h-7 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-amber-800 font-bold text-lg">Verificación pendiente</h3>
            <p className="text-amber-700 text-sm">Este perfil aún no ha sido verificado por el equipo de AgroDirecto. Proceda con precaución antes de realizar transacciones.</p>
          </div>
        </div>
      }

      {/* ALERTA DE RECHAZO */}
      {esRechazado &&
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg shadow-sm flex items-start gap-3">
          <ShieldAlert className="w-7 h-7 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-red-800 font-bold text-lg">Productor no verificado</h3>
            <p className="text-red-700 text-sm">La verificación de este productor fue rechazada. No se recomienda realizar transacciones.</p>
          </div>
        </div>
      }

      {/* CABECERA DEL PERFIL */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden mb-8">
        <div className="h-32 bg-gradient-to-r from-emerald-700 to-emerald-500 relative">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }} />
        </div>

        <div className="px-6 sm:px-10 pb-6 relative">
          <div className="flex flex-col sm:flex-row justify-between sm:items-end -mt-16 sm:-mt-12 mb-4">
            <div className="flex items-end">
              <div className="w-28 h-28 rounded-full border-4 border-white bg-emerald-800 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {getInitials(producer.nombreCompleto)}
              </div>
              <div className="ml-4 mb-2">
                <h1 className="text-3xl font-bold text-gray-800">{producer.nombreCompleto}</h1>
                <p className="text-emerald-600 font-semibold text-lg flex items-center gap-2">
                  <Star size={16} className="inline-block mr-1" /> {producer.nombreFinca || 'Finca sin nombre'}
                </p>
              </div>
            </div>

            <div className="mt-4 sm:mt-0 pb-2">
              {esVerificado ?
              <div className="bg-emerald-100 border border-emerald-300 text-emerald-800 px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-sm">
                  <Shield className="w-5 h-5" />Perfil Verificado
                </div> :
              esPendiente ?
              <div className="bg-amber-100 border border-amber-300 text-amber-800 px-4 py-2 rounded-full font-semibold flex items-center gap-2">
                  <Clock className="w-5 h-5" />Verificación Pendiente
                </div> :

              <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-2 rounded-full font-semibold flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5" />No Verificado
                </div>
              }
            </div>
          </div>

          <div className="flex flex-wrap gap-y-2 gap-x-6 text-gray-600 text-sm mt-4">
            <div className="flex items-center gap-1"><MapPin className="w-4 h-4" />{producer.municipio}, {producer.provincia}</div>
            <div className="flex items-center gap-1"><Phone className="w-4 h-4" />{producer.celular}</div>
            <div className="flex items-center gap-1"><Mail className="w-4 h-4" />{producer.correo}</div>
          </div>
        </div>
      </div>

      {/* MÉTRICAS Y PRODUCTOS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* COLUMNA: CONFIANZA */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2 border-emerald-200 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />Confianza
            </h2>

            {/* CALIFICACIÓN o PRODUCTOR NUEVO */}
            <div className="mb-5">
              <span className="block text-xs text-gray-500 uppercase font-semibold mb-2">Calificación</span>
              {esProductorNuevo ?
              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full">
                  <Star size={16} className="inline-block mr-1" /> Productor Nuevo
                </span> :

              <div className="flex items-center gap-2">
                  {renderStars(producer.calificacionPromedio)}
                  <span className="font-bold text-gray-700 text-lg">{producer.calificacionPromedio.toFixed(1)}</span>
                </div>
              }
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                <span className="text-sm text-gray-600 flex items-center gap-1"><TrendingUp className="w-4 h-4" />Ventas</span>
                <span className="font-bold text-gray-800">{producer.ventasCompletadas || 0}</span>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                <span className="text-sm text-gray-600 flex items-center gap-1"><Clock className="w-4 h-4" />Experiencia</span>
                <span className="font-bold text-gray-800">{producer.aniosExperiencia} años</span>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                <span className="text-sm text-gray-600">Tipo</span>
                <span className="font-bold text-emerald-600">{producer.tipoProductor}</span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-700 text-white rounded-2xl shadow-md p-6 text-center">
            <h3 className="font-bold text-lg mb-2">¿Comprar al por mayor?</h3>
            <p className="text-sm mb-4 opacity-90">Contacta directamente al productor.</p>
            <button className="bg-white text-emerald-700 font-bold py-2 px-4 rounded-xl w-full hover:bg-gray-100 transition flex items-center justify-center gap-2">
              <MessageCircle className="w-5 h-5" />Enviar Mensaje
            </button>
          </div>
        </div>

        {/* COLUMNA: PRODUCTOS */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 h-full">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center justify-between">
              Productos Disponibles
              <span className="text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{products.length} encontrados</span>
            </h2>

            {products.length === 0 ?
            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
                <div className="text-5xl mb-3"><Star size={16} className="inline-block mr-1" /></div>
                <h3 className="text-gray-400 font-medium">Este productor aún no tiene productos publicados.</h3>
              </div> :

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.map((product) =>
              <div key={product.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
                    <div className="h-40 bg-gray-200 relative overflow-hidden">
                      <img src={product.imagenUrl || `https://placehold.co/400x300/1D9E75/white?text=${encodeURIComponent(product.nombre)}`}
                  alt={product.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-xs font-bold text-emerald-700 shadow">{product.categoria}</div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 mb-1">{product.nombre}</h3>
                      <div className="flex justify-between items-end mt-2">
                        <div>
                          <span className="text-emerald-600 font-black text-lg">Bs. {product.precio}</span>
                          <span className="text-gray-500 text-xs ml-1">/ {product.unidadMedida}</span>
                        </div>
                        <span className="text-xs text-gray-500">Stock: {product.stockAcumulado}</span>
                      </div>
                    </div>
                  </div>
              )}
              </div>
            }
          </div>
        </div>
      </div>
    </div>);

};

export default ProducerProfile;