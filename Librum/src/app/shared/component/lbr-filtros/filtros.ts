import { dataISO } from '../../../utils/data.util';

/**
 * Motor de filtros do sistema: tipos de configuração e funções puras de filtragem.
 * A tela descreve QUAIS filtros quer (ConfigFiltro) e o componente `lbr-filtros` cuida da interface.
 */

export interface OpcaoFiltro {
  valor: string | number;
  rotulo: string;
}

interface CampoBase<T> {
  /** Identificador do filtro; também é o nome do parâmetro na URL. */
  chave: string;
  rotulo: string;
  /** Valor do item comparado com o filtro (pode ser uma lista, ex.: ids de gêneros). */
  valorDoItem: (item: T) => unknown;
}

/** Poucas opções fixas, exibidas como botões clicáveis (ex.: status, tipo). */
export interface CampoOpcoes<T> extends CampoBase<T> {
  tipo: 'opcoes';
  opcoes: OpcaoFiltro[];
}

/** Muitas opções, exibidas numa lista pesquisável (ex.: gênero, autor, usuário). */
export interface CampoLista<T> extends CampoBase<T> {
  tipo: 'lista';
  opcoes: OpcaoFiltro[];
  placeholder?: string;
}

/** Intervalo de datas (de/até, inclusivo). */
export interface CampoPeriodo<T> extends CampoBase<T> {
  tipo: 'periodo';
}

export type CampoFiltro<T> = CampoOpcoes<T> | CampoLista<T> | CampoPeriodo<T>;

export interface ConfigFiltro<T> {
  /** Textos do item onde a busca livre procura. */
  busca?: (item: T) => unknown[];
  placeholderBusca?: string;
  campos?: CampoFiltro<T>[];
}

/**
 * Valores atuais dos filtros, no mesmo formato da URL:
 * - `busca`: texto livre;
 * - campos de opções/lista: `chave` → lista de valores (como texto);
 * - campos de período: `chave + 'De'` e `chave + 'Ate'` → data `yyyy-MM-dd`.
 */
export type ValoresFiltro = Record<string, string | string[] | undefined>;

export const CHAVE_BUSCA = 'busca';
export const SUFIXO_DE = 'De';
export const SUFIXO_ATE = 'Ate';

/** Minúsculas e sem acentos, para comparar "Joao" com "João". */
export function normalizar(texto: unknown): string {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

function digitos(texto: string): string {
  return texto.replace(/\D/g, '');
}

/** Todas as palavras digitadas precisam aparecer em algum dos textos do item, em qualquer ordem. */
export function correspondeBusca(textos: unknown[], busca: string | undefined): boolean {
  const termos = normalizar(busca).split(/\s+/).filter(Boolean);
  if (!termos.length) return true;

  const conteudo = textos.map(normalizar).join(' ');
  const conteudoDigitos = digitos(conteudo);

  return termos.every((termo) => {
    if (conteudo.includes(termo.replace(/^#/, ''))) return true;
    // CPF, telefone, CEP: "123.456" também encontra "12345678900"
    const termoDigitos = digitos(termo);
    return termoDigitos.length >= 3 && conteudoDigitos.includes(termoDigitos);
  });
}

export function listaDe(valor: string | string[] | undefined): string[] {
  if (valor === undefined || valor === '') return [];
  return Array.isArray(valor) ? valor : [valor];
}

function correspondeCampo<T>(item: T, campo: CampoFiltro<T>, valores: ValoresFiltro): boolean {
  if (campo.tipo === 'periodo') {
    const de = valores[campo.chave + SUFIXO_DE] as string | undefined;
    const ate = valores[campo.chave + SUFIXO_ATE] as string | undefined;
    if (!de && !ate) return true;
    const data = dataISO(campo.valorDoItem(item) as Date | string | null);
    if (!data) return false;
    return (!de || data >= de) && (!ate || data <= ate);
  }

  const selecionados = listaDe(valores[campo.chave]);
  if (!selecionados.length) return true;

  // Dentro do mesmo filtro vale "qualquer um" (Romance OU Aventura).
  const valorItem = campo.valorDoItem(item);
  const doItem = (Array.isArray(valorItem) ? valorItem : [valorItem])
    .filter((v) => v !== undefined && v !== null)
    .map(String);
  return doItem.some((v) => selecionados.includes(v));
}

/** Aplica a busca e todos os filtros (filtros diferentes se somam: Romance E Disponível). */
export function filtrarItens<T>(
  itens: readonly T[],
  config: ConfigFiltro<T>,
  valores: ValoresFiltro,
): T[] {
  const busca = valores[CHAVE_BUSCA] as string | undefined;
  const campos = config.campos ?? [];
  return itens.filter(
    (item) =>
      (!config.busca || correspondeBusca(config.busca(item), busca)) &&
      campos.every((campo) => correspondeCampo(item, campo, valores)),
  );
}

/** Indica se há busca ou algum filtro preenchido. */
export function temFiltroAtivo(valores: ValoresFiltro): boolean {
  return Object.values(valores).some((valor) => listaDe(valor).some((v) => v.trim() !== ''));
}

/**
 * Monta as opções de um filtro a partir dos próprios dados (ex.: os usuários que aparecem
 * nos empréstimos), sem repetir e em ordem alfabética.
 */
export function opcoesDosItens<T>(
  itens: readonly T[],
  valor: (item: T) => string | number | undefined | null,
  rotulo: (item: T) => string | undefined | null = (item) => String(valor(item) ?? ''),
): OpcaoFiltro[] {
  const mapa = new Map<string, OpcaoFiltro>();
  for (const item of itens) {
    const v = valor(item);
    const r = rotulo(item);
    if (v === undefined || v === null || v === '' || !r) continue;
    if (!mapa.has(String(v))) mapa.set(String(v), { valor: v, rotulo: r });
  }
  return [...mapa.values()].sort((a, b) => a.rotulo.localeCompare(b.rotulo, 'pt-BR'));
}
