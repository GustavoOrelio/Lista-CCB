import { Voluntario } from "@/app/types/voluntario";
import { Igreja } from "@/app/types/igreja";
import { Cargo } from "@/app/types/cargo";
import { DiaSemana } from "@/app/types/diaSemana";
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

const formatarTelefone = (value: string) => {
  const numeros = value.replace(/\D/g, '').slice(0, 11);
  if (!numeros) return '';
  if (numeros.length <= 2) return numeros;
  if (numeros.length <= 7) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
  return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
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
  const igreja = igrejas.find(i => i.id === voluntario.igrejaId);

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const telefoneFormatado = formatarTelefone(e.target.value);
    onChange({ ...voluntario, telefone: telefoneFormatado });
  };

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
        <Label htmlFor="telefone">Telefone</Label>
        <Input
          id="telefone"
          type="tel"
          value={voluntario.telefone || ''}
          onChange={handleTelefoneChange}
          placeholder="(00) 00000-0000"
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

      {voluntario.igrejaId && igreja && (
        <div className="space-y-2">
          <Label>Disponibilidade</Label>
          <div className="space-y-2">
            {diasSemana
              .filter(dia => igreja[dia.cultoProp])
              .map((dia) => (
                <div key={dia.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`disponibilidade-${dia.id}`}
                    checked={voluntario.disponibilidades[dia.id]}
                    onCheckedChange={(checked) =>
                      onChange({
                        ...voluntario,
                        disponibilidades: {
                          ...voluntario.disponibilidades,
                          [dia.id]: checked as boolean,
                        },
                      })
                    }
                  />
                  <Label htmlFor={`disponibilidade-${dia.id}`}>{dia.label}</Label>
                </div>
              ))}
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