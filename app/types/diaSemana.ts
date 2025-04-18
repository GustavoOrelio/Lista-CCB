export type DiaId =
  | "domingoRDJ"
  | "domingo"
  | "segunda"
  | "terca"
  | "quarta"
  | "quinta"
  | "sexta"
  | "sabado";
export type CultoProp =
  | "cultoDomingoRDJ"
  | "cultoDomingo"
  | "cultoSegunda"
  | "cultoTerca"
  | "cultoQuarta"
  | "cultoQuinta"
  | "cultoSexta"
  | "cultoSabado";

export interface DiaSemana {
  id: DiaId;
  key: DiaId;
  label: string;
  cultoProp: CultoProp;
}
