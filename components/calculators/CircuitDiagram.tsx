// components/calculators/CircuitDiagram.tsx
"use client";

interface CircuitDiagramProps {
  type: 'series' | 'parallel';
}

// Componente per il simbolo del resistore
const Resistor = ({ x, y }: { x: number, y: number }) => (
  <g transform={`translate(${x}, ${y})`}>
    <path d="M0 15 H10 L12.5 5 L17.5 25 L22.5 5 L27.5 25 L32.5 5 L37.5 25 L40 15 H50" stroke="black" strokeWidth="1.5" fill="none" />
    <text x="25" y="35" textAnchor="middle" fontSize="12">R</text>
  </g>
);

// Componente per il simbolo dell'induttore
const Inductor = ({ x, y }: { x: number, y: number }) => (
  <g transform={`translate(${x}, ${y})`}>
    <path d="M0 15 H10 C15 0, 20 0, 25 15 C30 30, 35 30, 40 15 H50" stroke="black" strokeWidth="1.5" fill="none" />
    <text x="25" y="35" textAnchor="middle" fontSize="12">L</text>
  </g>
);

// Componente per il simbolo del condensatore
const Capacitor = ({ x, y }: { x: number, y: number }) => (
  <g transform={`translate(${x}, ${y})`}>
    <path d="M0 15 H20 M20 0 V30 M30 0 V30 M30 15 H50" stroke="black" strokeWidth="1.5" fill="none" />
    <text x="25" y="40" textAnchor="middle" fontSize="12">C</text>
  </g>
);

export default function CircuitDiagram({ type }: CircuitDiagramProps) {
  if (type === 'series') {
    return (
      <svg width="250" height="60" viewBox="0 0 250 60" aria-label="Diagramma di un circuito RLC in serie">
        <title>Circuito RLC in Serie</title>
        <path d="M0 15 H20" stroke="black" strokeWidth="1.5" fill="none" />
        <Resistor x={20} y={0} />
        <Inductor x={75} y={0} />
        <Capacitor x={130} y={0} />
        <path d="M185 15 H200" stroke="black" strokeWidth="1.5" fill="none" />
         {/* Fonte AC */}
        <circle cx="215" cy="15" r="10" stroke="black" strokeWidth="1.5" fill="none" />
        <path d="M210 15 C212.5 10, 217.5 20, 220 15" stroke="black" strokeWidth="1" fill="none"/>
        <path d="M225 15 H250 M0 15 V45 H250 V15" stroke="black" strokeWidth="1.5" fill="none" />
      </svg>
    );
  }

  if (type === 'parallel') {
    return (
      <svg width="200" height="150" viewBox="0 0 200 150" aria-label="Diagramma di un circuito RLC in parallelo">
         <title>Circuito RLC in Parallelo</title>
        {/* Linee principali */}
        <path d="M50 15 H150 M50 115 H150" stroke="black" strokeWidth="1.5" fill="none" />
        {/* Collegamento Fonte */}
        <path d="M10 65 H25" stroke="black" strokeWidth="1.5" fill="none" />
        <circle cx="40" cy="65" r="10" stroke="black" strokeWidth="1.5" fill="none" />
        <path d="M35 65 C37.5 60, 42.5 70, 45 65" stroke="black" strokeWidth="1" fill="none"/>
        <path d="M50 65 H50 15" stroke="black" strokeWidth="1.5" fill="none" />
        <path d="M50 15 V115" stroke="black" strokeWidth="1.5" fill="none" />
        <path d="M150 15 V115" stroke="black" strokeWidth="1.5" fill="none" />
        
        {/* Componenti */}
        <g transform="translate(50, 20) rotate(90 25 15)">
            <Resistor x={0} y={0} />
        </g>
         <g transform="translate(90, 20) rotate(90 25 15)">
            <Inductor x={0} y={0} />
        </g>
        <g transform="translate(130, 20) rotate(90 25 15)">
            <Capacitor x={0} y={0} />
        </g>
      </svg>
    );
  }

  return null;
}