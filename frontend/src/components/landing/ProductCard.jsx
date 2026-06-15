import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Eye } from 'lucide-react';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { id, cosecha_id, nombre_producto, precio_unitario, unidad_medida, foto_url, nombre_finca, productor_nombre, municipio } = product;
  const productId = cosecha_id || id;

  const imageSrc = foto_url
    ? (foto_url.startsWith('http') ? foto_url : `http://localhost:5000${foto_url}`)
    : 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop';

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-lg shadow-slate-200/50 border border-slate-100 group hover:-translate-y-2 hover:shadow-xl transition-all duration-500">
      <div className="relative h-52 overflow-hidden">
        <img
          src={imageSrc}
          alt={nombre_producto || 'Producto agrícola'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white/90 text-xs font-bold bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <MapPin className="w-3 h-3" />
          {municipio || 'Santa Cruz'}
        </div>
      </div>
      <div className="p-5">
        <h4 className="font-black text-lg text-slate-900 mb-1 truncate">{nombre_producto || 'Producto'}</h4>
        <p className="text-sm text-slate-500 font-medium mb-4">{nombre_finca || productor_nombre || 'Finca local'}</p>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Precio</p>
            <p className="text-2xl font-black text-emerald-600">
              Bs. {precio_unitario || '—'}
              <span className="text-sm font-bold text-slate-400 ml-1">/{unidad_medida || 'kg'}</span>
            </p>
          </div>
          <button
            onClick={() => navigate(`/producto/${productId}`)}
            className="w-11 h-11 bg-slate-900 hover:bg-emerald-600 rounded-xl flex items-center justify-center text-white transition-colors shadow-lg"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
