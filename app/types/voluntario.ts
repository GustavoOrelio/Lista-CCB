export interface Voluntario {
  id: string;
  nome: string;
  igrejaId: string;
  igrejaNome: string;
  disponibilidades?: {
    domingo: boolean;
    segunda: boolean;
    terca: boolean;
    quarta: boolean;
    quinta: boolean;
    sexta: boolean;
    sabado: boolean;
  };
}
