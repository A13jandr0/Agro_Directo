import React, { useState, useEffect } from 'react';

const VerificationPanel = () => {
    const [pendingUsers, setPendingUsers] = useState([
        { Id: 1, NombreCompleto: 'Carlos Mendoza', Rol: 'Productor', FechaRegistro: '2026-04-25', DocumentoIdentidad: '/uploads/doc1.pdf' },
        { Id: 2, NombreCompleto: 'Logistica SRL', Rol: 'Transportista', FechaRegistro: '2026-04-26', LicenciaConducir: '/uploads/lic1.jpg' }
    ]);

    const handleVerify = async (userId, status) => {
        // LLamada a API: POST /api/auth/admin/verify
        // await fetch('/api/auth/admin/verify', { method: 'POST', body: JSON.stringify({ userId, status }) })
        
        setPendingUsers(pendingUsers.filter(u => u.Id !== userId));
        alert(`Usuario ${status} con éxito.`);
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Panel de Administración: Verificación de Usuarios</h1>
            
            <div className="overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Nombre / Razón Social</th>
                            <th className="px-6 py-3">Rol</th>
                            <th className="px-6 py-3">Fecha de Registro</th>
                            <th className="px-6 py-3">Documento</th>
                            <th className="px-6 py-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingUsers.length === 0 ? (
                            <tr><td colSpan="5" className="px-6 py-4 text-center">No hay usuarios pendientes</td></tr>
                        ) : (
                            pendingUsers.map(user => (
                                <tr key={user.Id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{user.NombreCompleto}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs ${user.Rol === 'Productor' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                            {user.Rol}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{user.FechaRegistro}</td>
                                    <td className="px-6 py-4">
                                        <a href={user.DocumentoIdentidad || user.LicenciaConducir} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                            Ver Documento
                                        </a>
                                    </td>
                                    <td className="px-6 py-4 flex gap-2">
                                        <button onClick={() => handleVerify(user.Id, 'Verificado')} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">Aprobar</button>
                                        <button onClick={() => handleVerify(user.Id, 'Rechazado')} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Rechazar</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default VerificationPanel;
