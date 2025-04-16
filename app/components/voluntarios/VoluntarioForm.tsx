import { Voluntario } from "@/app/types/voluntario";
import { Igreja } from "@/app/types/igreja";
import { Cargo } from "@/app/types/cargo";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";

type DiaSemana = {
  key: keyof Voluntario['disponibilidades'];
  label: string;
  cultoProp: keyof Igreja;
};

interface VoluntarioFormProps {
  voluntario: Omit<Voluntario, 'id'> & {
    disponibilidades: NonNullable<Voluntario['disponibilidades']>;
  };
  igrejas: Igreja[];
  cargos: Cargo[];
  diasSemana: DiaSemana[];
  onSubmit: (e: React.FormEvent) => void;
  onChange: (voluntario: Omit<Voluntario, 'id'> & {
    disponibilidades: NonNullable<Voluntario['disponibilidades']>;
  }) => void;
  onIgrejaChange: (igrejaId: string) => void;
  onCargoChange: (cargoId: string) => void;
  isEditing: boolean;
  onCancel: () => void;
}

export function VoluntarioForm({
  voluntario,
  igrejas,
  cargos,
  diasSemana,
  onSubmit,
  onChange,
  onIgrejaChange,
  onCargoChange,
  isEditing,
  onCancel,
}: VoluntarioFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome</Label>
        <Input
          id="nome"
          value={voluntario.nome}
          onChange={(e) =>
            onChange({ ...voluntario, nome: e.target.value })
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="igreja">Igreja</Label>
        <Select
          value={voluntario.igrejaId}
          onValueChange={onIgrejaChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma igreja" />
          </SelectTrigger>
          <SelectContent>
            {igrejas.map((igreja) => (
              <SelectItem key={igreja.id} value={igreja.id}>
                {igreja.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cargo">Cargo</Label>
        <Select
          value={voluntario.cargoId}
          onValueChange={onCargoChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um cargo" />
          </SelectTrigger>
          <SelectContent>
            {cargos.filter(cargo => cargo.ativo).map((cargo) => (
              <SelectItem key={cargo.id} value={cargo.id}>
                {cargo.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {voluntario.igrejaId && (
        <div className="space-y-2">
          <Label>Disponibilidade</Label>
          <div className="space-y-2">
            {diasSemana.map((dia) => {
              const igreja = igrejas.find((i) => i.id === voluntario.igrejaId);
              if (!igreja || !igreja[dia.cultoProp]) return null;

              return (
                <div key={dia.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`disponibilidade-${dia.key}`}
                    checked={voluntario.disponibilidades[dia.key]}
                    onCheckedChange={(checked) =>
                      onChange({
                        ...voluntario,
                        disponibilidades: {
                          ...voluntario.disponibilidades,
                          [dia.key]: checked as boolean,
                        },
                      })
                    }
                  />
                  <Label htmlFor={`disponibilidade-${dia.key}`}>
                    Disponível para {dia.label}
                  </Label>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button type="submit">
          {isEditing ? "Salvar Alterações" : "Salvar"}
        </Button>
      </div>
    </form>
  );
} 