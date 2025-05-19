'use client';

import React, { useRef, useState, useEffect } from 'react';

export default function Telemedicina() {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    // Initialize WebRTC connection here (simplified placeholder)
    const pc = new RTCPeerConnection();
    setPeerConnection(pc);

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    });

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    return () => {
      pc.close();
    };
  }, []);

  // Digital signature handlers
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    isDrawing.current = true;
    draw(e);
  };

  const endDrawing = () => {
    isDrawing.current = false;
    if (canvasRef.current) {
      setSignatureDataUrl(canvasRef.current.toDataURL());
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';

    const rect = canvasRef.current.getBoundingClientRect();
    let x: number, y: number;

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearSignature = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.beginPath();
        setSignatureDataUrl(null);
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Telemedicina</h1>
      <div className="flex space-x-4">
        <div>
          <h2 className="font-semibold">Video Local</h2>
          <video ref={localVideoRef} autoPlay muted playsInline className="w-64 h-48 bg-black" />
        </div>
        <div>
          <h2 className="font-semibold">Video Remoto</h2>
          <video ref={remoteVideoRef} autoPlay playsInline className="w-64 h-48 bg-black" />
        </div>
      </div>
      <div>
        <h2 className="font-semibold">Firma Digital de Recetas</h2>
        <canvas
          ref={canvasRef}
          width={400}
          height={150}
          className="border border-gray-300"
          onMouseDown={startDrawing}
          onMouseUp={endDrawing}
          onMouseMove={draw}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchEnd={endDrawing}
          onTouchMove={draw}
        />
        <div className="mt-2 space-x-2">
          <button
            onClick={clearSignature}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Limpiar
          </button>
          {signatureDataUrl && (
            <a
              href={signatureDataUrl}
              download="firma.png"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Descargar Firma
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
