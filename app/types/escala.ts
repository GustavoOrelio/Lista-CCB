export interface EscalaItem {
  data: Date;
  voluntarios: {
    id: string;
    nome: string;
  }[];
  igrejaId: string;
  cargoId: string;
  tipoCulto: string; // 'domingoRDJ' | 'domingo' | 'segunda' | etc
}
