'use client';

// Componente temporariamente simplificado durante migração

interface PeopleManagerProps {
  selectedPorteiros: any[];
  onPorteirosChange: (porteiros: any[]) => void;
}

export default function PeopleManager({ selectedPorteiros, onPorteirosChange }: PeopleManagerProps) {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Gerenciar Porteiros</h2>
      <p className="text-gray-600">Componente temporariamente desabilitado durante migração.</p>
    </div>
  );
} 