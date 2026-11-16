/** Funções de data usadas em todo o sistema (sempre em horário local, sem deslocar o dia pelo fuso). */

/** Data no formato `yyyy-MM-dd` (como o `<input type="date">` e o backend usam). */
export function dataISO(data?: Date | string | null): string {
  if (!data) return '';
  if (typeof data === 'string') return data.slice(0, 10);
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${data.getFullYear()}-${mes}-${dia}`;
}

/** `dd/MM/yyyy`, ou "—" quando não há data. */
export function formatarDataBR(data?: Date | string | null): string {
  const iso = dataISO(data);
  if (!iso) return '—';
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
}

/** Hoje + `dias`, no formato `yyyy-MM-dd` (`dataDaquiA(0)` é hoje). */
export function dataDaquiA(dias: number): string {
  const data = new Date();
  data.setDate(data.getDate() + dias);
  return dataISO(data);
}
