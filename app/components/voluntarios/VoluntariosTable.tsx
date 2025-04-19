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
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

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

  return (
    <div className="space-y-8">
      {Object.entries(voluntariosAgrupados).map(([igrejaId, igreja]) => (
        <div key={igrejaId} className="rounded-md border">
          <div className="bg-muted p-4">
            <h2 className="text-lg font-semibold">{igreja.igrejaNome}</h2>
          </div>
          {Object.entries(igreja.cargos).map(([cargoId, cargo]) => (
            <div key={cargoId} className="border-t">
              <div className="bg-muted/50 p-2">
                <h3 className="font-medium">{cargo.cargoNome}</h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Disponibilidade</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cargo.voluntarios.map((voluntario) => (
                    <TableRow key={voluntario.id}>
                      <TableCell className="font-medium">{voluntario.nome}</TableCell>
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
            </div>
          ))}
        </div>
      ))}
    </div>
  );
} 