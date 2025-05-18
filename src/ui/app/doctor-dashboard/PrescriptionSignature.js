"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const PrescriptionSignature = () => {
    const canvasRef = (0, react_1.useRef)(null);
    const [isDrawing, setIsDrawing] = (0, react_1.useState)(false);
    const [context, setContext] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                ctx.lineCap = 'round';
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 2;
                setContext(ctx);
            }
        }
    }, []);
    const startDrawing = (event) => {
        if (context) {
            context.beginPath();
            context.moveTo(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
            setIsDrawing(true);
        }
    };
    const draw = (event) => {
        if (isDrawing && context) {
            context.lineTo(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
            context.stroke();
        }
    };
    const stopDrawing = () => {
        if (context) {
            context.closePath();
        }
        setIsDrawing(false);
    };
    const clearCanvas = () => {
        if (context && canvasRef.current) {
            context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "p-4 border rounded", children: [(0, jsx_runtime_1.jsx)("h2", { children: "Prescription Digital Signature" }), (0, jsx_runtime_1.jsx)("canvas", { ref: canvasRef, width: 500, height: 200, style: { border: '1px solid #000' }, onMouseDown: startDrawing, onMouseMove: draw, onMouseUp: stopDrawing, onMouseLeave: stopDrawing }), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: '1rem' }, children: (0, jsx_runtime_1.jsx)("button", { onClick: clearCanvas, children: "Clear Signature" }) })] }));
};
exports.default = PrescriptionSignature;
