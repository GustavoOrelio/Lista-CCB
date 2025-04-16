import { Voluntario } from "@/app/types/voluntario";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

interface VoluntariosTableProps {
  voluntarios: Voluntario[];
  onEdit: (voluntario: Voluntario) => void;
  onDelete: (id: string) => void;
  formatarDisponibilidades: (disponibilidades: Voluntario['disponibilidades']) => string;
}

export function VoluntariosTable({
  voluntarios,
  onEdit,
  onDelete,
  formatarDisponibilidades,
}: VoluntariosTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Igreja</TableHead>
            <TableHead>Disponibilidade</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {voluntarios.map((voluntario) => (
            <TableRow key={voluntario.id}>
              <TableCell className="font-medium">{voluntario.nome}</TableCell>
              <TableCell>{voluntario.igrejaNome}</TableCell>
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
  );
} 