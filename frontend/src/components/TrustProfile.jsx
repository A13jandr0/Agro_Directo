import React from 'react';

const TrustProfile = ({ producer }) => {
    // producer prop mock: { name: 'Juan Perez', rating: 4.5, experience: 5, sales: 10, status: 'Verificado' }
    
    return (
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl m-4 border border-gray-200">
            <div className="md:flex">
                <div className="p-8 w-full">
                    <div className="flex justify-between items-center">
                        <div className="uppercase tracking-wide text-sm text-green-600 font-semibold">Perfil de Productor</div>
                        
                        {producer.status === 'Pendiente de Verificacion' && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded border border-yellow-300">
                                ⚠️ Verificación pendiente
                            </span>
                        )}
                        {producer.status === 'Verificado' && (
                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded border border-green-300">
                                ✓ Productor Verificado
                            </span>
                        )}
                    </div>
                    
                    <h2 className="block mt-1 text-lg leading-tight font-medium text-black">{producer.name}</h2>
                    
                    <div className="mt-4 flex items-center">
                        <div className="flex text-yellow-400">
                            {'★'.repeat(Math.floor(producer.rating))}
                            {'☆'.repeat(5 - Math.floor(producer.rating))}
                        </div>
                        <span className="ml-2 text-gray-600 text-sm">({producer.rating} / 5.0)</span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded">
                            <p className="text-xs text-gray-500 uppercase">Experiencia</p>
                            <p className="font-semibold text-gray-800">{producer.experience} años</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                            <p className="text-xs text-gray-500 uppercase">Ventas Exitosas</p>
                            {producer.sales === 0 ? (
                                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">Productor nuevo</span>
                            ) : (
                                <p className="font-semibold text-gray-800">{producer.sales}</p>
                            )}
                        </div>
                    </div>

                    {producer.status !== 'Verificado' && (
                        <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">
                                        Este perfil aún no ha sido validado por el administrador. Las transacciones no están garantizadas.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrustProfile;
