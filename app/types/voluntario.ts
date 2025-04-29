export interface Voluntario {
  id: string;
  nome: string;
  telefone: string;
  igrejaId: string;
  igrejaNome: string;
  cargoId: string;
  cargoNome: string;
  disponibilidades?: {
    domingoRDJ: boolean;
    domingo: boolean;
    segunda: boolean;
    terca: boolean;
    quarta: boolean;
    quinta: boolean;
    sexta: boolean;
    sabado: boolean;
  };
}
