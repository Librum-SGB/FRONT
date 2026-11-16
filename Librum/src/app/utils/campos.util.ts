/** Uma linha "rótulo: valor" exibida nas telas de detalhe. */
export interface CampoDetalhe {
  rotulo: string;
  valor: string;
}

/** Só os campos preenchidos (ignora vazio e "—"), já como texto, na ordem informada. */
export function camposPreenchidos(campos: [rotulo: string, valor: unknown][]): CampoDetalhe[] {
  return campos
    .filter(([, valor]) => valor !== undefined && valor !== null && valor !== '' && valor !== '—')
    .map(([rotulo, valor]) => ({ rotulo, valor: String(valor) }));
}
