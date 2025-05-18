import React from 'react';
import WhatsAppQrCode from '../../../ui/components/WhatsAppQrCode';
import WhatsAppConnections from '../../../ui/whatsapp/WhatsAppConnections';

/**
 * Página principal del panel de administración.
 * Incluye autenticación por QR y gestión de múltiples números de WhatsApp.
 */
export default function AdminPanelPage() {
  return (
    <main className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Panel de Administración</h1>
      {/* Sección de autenticación por QR */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Autenticación WhatsApp</h2>
        <WhatsAppQrCode />
      </section>
      {/* Sección de gestión de números */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Gestión de Números</h2>
        <WhatsAppConnections />
      </section>
    </main>
  );
}
