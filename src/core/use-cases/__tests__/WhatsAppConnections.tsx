import React from "react";

/**
 * Lista y gestiona múltiples conexiones de WhatsApp.
 * Puedes expandir este componente para agregar/eliminar números.
 */
const WhatsAppConnections: React.FC = () => {
  // TODO: Traer la lista real de números desde el backend
  const numbers = [
    { id: 1, number: "+5491112345678", status: "active" },
    { id: 2, number: "+5491198765432", status: "pending" },
  ];

  return (
    <div className="border p-4 rounded">
      <ul>
        {numbers.map((n) => (
          <li key={n.id} className="flex justify-between items-center my-2">
            <span>{n.number}</span>
            <span
              className={
                n.status === "active"
                  ? "text-green-600"
                  : n.status === "pending"
                  ? "text-yellow-600"
                  : "text-red-600"
              }
            >
              {n.status}
            </span>
          </li>
        ))}
      </ul>
      {/* Aquí puedes agregar botones para agregar/eliminar números */}
    </div>
  );
};

export default WhatsAppConnections;