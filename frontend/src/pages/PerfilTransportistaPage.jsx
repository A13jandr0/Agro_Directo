import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Truck, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import PageShell from '../components/ui/PageShell';
import PageHeader from '../components/ui/PageHeader';
import PerfilDatosCompleto from '../components/PerfilDatosCompleto';

const PerfilTransportistaPage = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');
        const res = await axios.get('http://localhost:5000/api/usuarios/mi-perfil', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfileData(res.data);
      } catch (error) {
        console.error('Error al cargar perfil:', error);
        toast.error('No se pudo cargar tu perfil');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center py-24">
        <div className="w-10 h-10 border-2 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (profileData?.estado !== 'VERIFICADO') {
    return (
      <PageShell>
        <div className="card-elevated p-8 max-w-2xl mx-auto text-center mb-6">
          <AlertCircle className="mx-auto text-amber-500 w-14 h-14 mb-4" />
          <h2 className="text-xl font-bold text-amber-900 mb-2">Cuenta pendiente de verificación</h2>
          <p className="text-amber-800 text-sm">
            Tus datos de registro están guardados. El equipo revisará tu documentación.
          </p>
        </div>
        {profileData && <PerfilDatosCompleto data={profileData} modo="owner" />}
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        icon={Truck}
        badge="Transportista"
        title="Mi perfil"
        subtitle="Todos los datos que registraste al unirte a AgroDirecto"
      />

      {profileData && <PerfilDatosCompleto data={profileData} modo="owner" />}
    </PageShell>
  );
};

export default PerfilTransportistaPage;
