import React, { useEffect, useState } from "react";

/**
 * Muestra el código QR para autenticar WhatsApp y el estado de la sesión.
 */
const WhatsAppQrCode: React.FC = () => {
  const [qr, setQr] = useState<string | null>(null);
  const [status, setStatus] = useState<"pending" | "active" | "expired">("pending");

  // Simula la obtención del QR desde el backend
  useEffect(() => {
    // Aquí deberías hacer fetch a tu API real
    setTimeout(() => {
      setQr("/api/whatsapp/qr"); // Reemplaza por la URL real del QR
      setStatus("pending");
    }, 500);
  }, []);

  return (
    <div className="border p-4 rounded">
      <p>Escanea este código QR con WhatsApp para autenticar.</p>
      {qr && <img src={qr} alt="QR de WhatsApp" className="my-2" />}
      <div>
        Estado de sesión:{" "}
        <span className="font-semibold">
          {status === "active" && "Activa"}
          {status === "expired" && "Expirada"}
          {status === "pending" && "Pendiente"}
        </span>
      </div>
    </div>
  );
};

export default WhatsAppQrCode;