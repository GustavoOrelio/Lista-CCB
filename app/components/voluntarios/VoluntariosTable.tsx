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
import { Badge } from "@/app/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/app/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/components/ui/tooltip";
import { PencilIcon, TrashIcon, ChevronDownIcon, ChevronRightIcon, PhoneIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

interface VoluntariosTableProps {
  voluntarios: Voluntario[];
  onEdit: (voluntario: Voluntario) => void;
  onDelete: (id: string) => void;
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
        <div key={igrejaId} className="rounded-md border shadow-sm">
          <button
            className="w-full bg-muted p-4 flex items-center justify-between hover:bg-muted/80 transition-colors rounded-t-md"
            onClick={() => toggleIgreja(igrejaId)}
          >
            <h2 className="text-lg font-semibold flex items-center">
              {expandedIgrejas.has(igrejaId) ? (
                <ChevronDownIcon className="h-5 w-5 mr-2" />
              ) : (
                <ChevronRightIcon className="h-5 w-5 mr-2" />
              )}
              {igreja.igrejaNome}
              <Badge variant="secondary" className="ml-3">
                {Object.values(igreja.cargos).reduce((total, cargo) => total + cargo.voluntarios.length, 0)} voluntários
              </Badge>
            </h2>
          </button>

          {expandedIgrejas.has(igrejaId) && (
            <div className="border-t">
              {Object.entries(igreja.cargos).map(([cargoId, cargo]) => (
                <div key={cargoId} className="border-t">
                  <button
                    className="w-full bg-muted/50 p-3 flex items-center justify-between hover:bg-muted/60 transition-colors"
                    onClick={() => toggleCargo(igrejaId, cargoId)}
                  >
                    <h3 className="font-medium flex items-center">
                      {expandedCargos.has(`${igrejaId}-${cargoId}`) ? (
                        <ChevronDownIcon className="h-4 w-4 mr-2" />
                      ) : (
                        <ChevronRightIcon className="h-4 w-4 mr-2" />
                      )}
                      {cargo.cargoNome}
                      <Badge variant="outline" className="ml-3">
                        {cargo.voluntarios.length} voluntários
                      </Badge>
                    </h3>
                  </button>

                  {expandedCargos.has(`${igrejaId}-${cargoId}`) && (
                    <div className="w-full overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="px-2 py-2 text-xs sm:text-sm">Nome</TableHead>
                            <TableHead className="px-2 py-2 text-xs sm:text-sm">Contato</TableHead>
                            <TableHead className="px-2 py-2 text-xs sm:text-sm">Disponibilidade</TableHead>
                            <TableHead className="px-2 py-2 text-xs sm:text-sm text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {cargo.voluntarios.map((voluntario) => (
                            <TableRow key={voluntario.id}>
                              <TableCell className="font-medium px-2 py-2 truncate max-w-[120px]">{voluntario.nome}</TableCell>
                              <TableCell className="px-2 py-2 truncate max-w-[120px]">
                                <HoverCard>
                                  <HoverCardTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8">
                                      <PhoneIcon className="h-4 w-4 mr-2" />
                                      {voluntario.telefone}
                                    </Button>
                                  </HoverCardTrigger>
                                  <HoverCardContent className="w-fit">
                                    <div className="flex flex-col gap-2">
                                      <a
                                        href={`tel:${voluntario.telefone}`}
                                        className="text-sm text-blue-600 hover:underline"
                                      >
                                        Ligar para {voluntario.telefone}
                                      </a>
                                      <a
                                        href={`https://wa.me/${voluntario.telefone.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-green-600 hover:underline"
                                      >
                                        Enviar WhatsApp
                                      </a>
                                    </div>
                                  </HoverCardContent>
                                </HoverCard>
                              </TableCell>
                              <TableCell className="px-2 py-2 truncate max-w-[120px]">
                                <HoverCard>
                                  <HoverCardTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8">
                                      <CalendarIcon className="h-4 w-4 mr-2" />
                                      Ver disponibilidade
                                    </Button>
                                  </HoverCardTrigger>
                                  <HoverCardContent className="w-80">
                                    <div className="space-y-2">
                                      <h4 className="text-sm font-semibold">Dias disponíveis:</h4>
                                      <div className="flex flex-wrap gap-2">
                                        {Object.entries(voluntario.disponibilidades || {}).map(([dia, disponivel]) => (
                                          disponivel && (
                                            <Badge
                                              key={dia}
                                              variant={dia.includes('domingo') ? 'default' : 'secondary'}
                                            >
                                              {dia === 'domingoRDJ' ? 'Domingo (RDJ)' :
                                                dia.charAt(0).toUpperCase() + dia.slice(1)}
                                            </Badge>
                                          )
                                        ))}
                                      </div>
                                    </div>
                                  </HoverCardContent>
                                </HoverCard>
                              </TableCell>
                              <TableCell className="px-2 py-2 text-right">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onEdit(voluntario)}
                                        className="mr-2"
                                      >
                                        <PencilIcon className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Editar voluntário</p>
                                    </TooltipContent>
                                  </Tooltip>

                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onDelete(voluntario.id)}
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                      >
                                        <TrashIcon className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Excluir voluntário</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
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