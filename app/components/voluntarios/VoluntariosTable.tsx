import { Voluntario } from "@/app/types/voluntario";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { Button } from "@/app/components/ui/button";
import { PencilIcon, TrashIcon, ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

interface VoluntariosTableProps {
  voluntarios: Voluntario[];
  onEdit: (voluntario: Voluntario) => void;
  onDelete: (id: string) => void;
  formatarDisponibilidades: (disponibilidades: Voluntario['disponibilidades']) => string;
}

interface VoluntariosAgrupados {
  [igrejaId: string]: {
    igrejaNome: string;
    cargos: {
      [cargoId: string]: {
        cargoNome: string;
        voluntarios: Voluntario[];
      };
    };
  };
}

export function VoluntariosTable({
  voluntarios,
  onEdit,
  onDelete,
  formatarDisponibilidades,
}: VoluntariosTableProps) {
  const [expandedIgrejas, setExpandedIgrejas] = useState<Set<string>>(new Set());
  const [expandedCargos, setExpandedCargos] = useState<Set<string>>(new Set());

  // Agrupar voluntários por igreja e cargo
  const voluntariosAgrupados = voluntarios.reduce<VoluntariosAgrupados>((acc, voluntario) => {
    if (!acc[voluntario.igrejaId]) {
      acc[voluntario.igrejaId] = {
        igrejaNome: voluntario.igrejaNome,
        cargos: {},
      };
    }

    if (!acc[voluntario.igrejaId].cargos[voluntario.cargoId]) {
      acc[voluntario.igrejaId].cargos[voluntario.cargoId] = {
        cargoNome: voluntario.cargoNome,
        voluntarios: [],
      };
    }

    acc[voluntario.igrejaId].cargos[voluntario.cargoId].voluntarios.push(voluntario);
    return acc;
  }, {});

  const toggleIgreja = (igrejaId: string) => {
    const newExpandedIgrejas = new Set(expandedIgrejas);
    if (newExpandedIgrejas.has(igrejaId)) {
      newExpandedIgrejas.delete(igrejaId);
      // Quando colapsar uma igreja, colapsar todos os cargos dela também
      const newExpandedCargos = new Set(expandedCargos);
      Object.keys(voluntariosAgrupados[igrejaId].cargos).forEach(cargoId => {
        newExpandedCargos.delete(`${igrejaId}-${cargoId}`);
      });
      setExpandedCargos(newExpandedCargos);
    } else {
      newExpandedIgrejas.add(igrejaId);
    }
    setExpandedIgrejas(newExpandedIgrejas);
  };

  const toggleCargo = (igrejaId: string, cargoId: string) => {
    const compositeId = `${igrejaId}-${cargoId}`;
    const newExpandedCargos = new Set(expandedCargos);
    if (newExpandedCargos.has(compositeId)) {
      newExpandedCargos.delete(compositeId);
    } else {
      newExpandedCargos.add(compositeId);
    }
    setExpandedCargos(newExpandedCargos);
  };

  return (
    <div className="space-y-4">
      {Object.entries(voluntariosAgrupados).map(([igrejaId, igreja]) => (
        <div key={igrejaId} className="rounded-md border">
          <button
            className="w-full bg-muted p-4 flex items-center justify-between hover:bg-muted/80 transition-colors"
            onClick={() => toggleIgreja(igrejaId)}
          >
            <h2 className="text-lg font-semibold flex items-center">
              {expandedIgrejas.has(igrejaId) ? (
                <ChevronDownIcon className="h-5 w-5 mr-2" />
              ) : (
                <ChevronRightIcon className="h-5 w-5 mr-2" />
              )}
              {igreja.igrejaNome}
              <span className="ml-2 text-sm text-muted-foreground">
                ({Object.values(igreja.cargos).reduce((total, cargo) => total + cargo.voluntarios.length, 0)} voluntários)
              </span>
            </h2>
          </button>

          {expandedIgrejas.has(igrejaId) && (
            <div className="border-t">
              {Object.entries(igreja.cargos).map(([cargoId, cargo]) => (
                <div key={cargoId} className="border-t">
                  <button
                    className="w-full bg-muted/50 p-2 flex items-center justify-between hover:bg-muted/60 transition-colors"
                    onClick={() => toggleCargo(igrejaId, cargoId)}
                  >
                    <h3 className="font-medium flex items-center">
                      {expandedCargos.has(`${igrejaId}-${cargoId}`) ? (
                        <ChevronDownIcon className="h-4 w-4 mr-2" />
                      ) : (
                        <ChevronRightIcon className="h-4 w-4 mr-2" />
                      )}
                      {cargo.cargoNome}
                      <span className="ml-2 text-sm text-muted-foreground">
                        ({cargo.voluntarios.length} voluntários)
                      </span>
                    </h3>
                  </button>

                  {expandedCargos.has(`${igrejaId}-${cargoId}`) && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Telefone</TableHead>
                          <TableHead>Disponibilidade</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cargo.voluntarios.map((voluntario) => (
                          <TableRow key={voluntario.id}>
                            <TableCell className="font-medium">{voluntario.nome}</TableCell>
                            <TableCell>{voluntario.telefone}</TableCell>
                            <TableCell>{formatarDisponibilidades(voluntario.disponibilidades)}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onEdit(voluntario)}
                                className="mr-2"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onDelete(voluntario.id)}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 