import { LbrBadgeVariant } from '../shared/component/lbr-badge/lbr-badge';
import { AutorResponse } from '../models/autor.model';
import { EditoraResponse } from '../models/editora.model';
import { ExemplarResponse } from '../models/exemplar.model';
import { GeneroResponse } from '../models/genero.model';
import { MaterialResponse } from '../models/material.model';

// Valor do enum StatusExemplar que significa "pode ser emprestado".
export const STATUS_EXEMPLAR_DISPONIVEL = 'DISPONIVEL';

const PREFIXOS: Record<string, string> = {
  LIVRO: 'L',
  PERIODICO: 'P',
  OUTRO: 'OM',
};

/** Nome de cada tipo de material, para exibir em tabelas, filtros e selos. */
export const ROTULOS_TIPO_MATERIAL: Record<string, string> = {
  LIVRO: 'Livro',
  PERIODICO: 'Periódico',
  OUTRO: 'Outros Materiais',
};

/** Opções do filtro "Tipo" (as mesmas em todas as telas). */
export const OPCOES_TIPO_MATERIAL = Object.entries(ROTULOS_TIPO_MATERIAL).map(([valor, rotulo]) => ({
  valor,
  rotulo,
}));

export function rotuloTipoMaterial(tipo: string): string {
  return ROTULOS_TIPO_MATERIAL[tipo] ?? tipo;
}

const VARIANTS: Record<string, LbrBadgeVariant> = {
  LIVRO: 'livro',
  PERIODICO: 'periodico',
  OUTRO: 'outros',
};

/** Material no formato de exibição, com os nomes já resolvidos (não os IDs). */
export interface MaterialExibicao {
  id: number;
  codigo: string;
  titulo: string;
  subtitulo?: string;
  tipo: string;
  tipoLabel: string;
  tipoVariant: LbrBadgeVariant;
  disponibilidade?: 'Disponível' | 'Indisponível';
  disponibilidadeVariant?: LbrBadgeVariant;
  autorId?: number;
  autorNome: string;
  editoraId?: number;
  editoraNome: string;
  anoPublicacao?: number;
  isbn?: string;
  edicao?: number;
  quantidadePaginas?: number;
  sinopse?: string;
  issn?: string;
  tema?: string;
  descricao?: string;
  observacao?: string;
  generoIds: number[];
  generoNomes: string;
}

export interface ReferenciasMaterial {
  autores: AutorResponse[];
  editoras: EditoraResponse[];
  generos: GeneroResponse[];
  /** IDs dos materiais com exemplar disponível; `undefined` quando os exemplares não foram carregados. */
  materiaisDisponiveis?: Set<number>;
}

export function materiaisComExemplarDisponivel(exemplares: ExemplarResponse[]): Set<number> {
  return new Set(
    exemplares.filter((e) => e.status === STATUS_EXEMPLAR_DISPONIVEL).map((e) => e.materialId),
  );
}

export function paraMaterialExibicao(
  m: MaterialResponse,
  referencias: ReferenciasMaterial,
): MaterialExibicao {
  const autor = referencias.autores.find((a) => a.id === m.autorId);
  const editora = referencias.editoras.find((e) => e.id === m.editoraId);
  const generoIds = m.generoIds ?? [];
  const nomesGeneros = generoIds
    .map((id) => referencias.generos.find((g) => g.id === id)?.nome)
    .filter((nome): nome is string => !!nome)
    .join(', ');

  let disponibilidade: MaterialExibicao['disponibilidade'];
  let disponibilidadeVariant: LbrBadgeVariant | undefined;

  if (referencias.materiaisDisponiveis) {
    const disponivel = referencias.materiaisDisponiveis.has(m.id);
    disponibilidade = disponivel ? 'Disponível' : 'Indisponível';
    disponibilidadeVariant = disponivel ? 'disponivel' : 'indisponivel';
  }

  return {
    id: m.id,
    codigo: (PREFIXOS[m.tipo] ?? 'M') + '-' + String(m.id).padStart(5, '0'),
    titulo: m.titulo,
    subtitulo: m.subtitulo,
    tipo: m.tipo,
    tipoLabel: rotuloTipoMaterial(m.tipo),
    tipoVariant: VARIANTS[m.tipo] ?? 'outros',
    disponibilidade,
    disponibilidadeVariant,
    autorId: m.autorId,
    autorNome: autor?.nome ?? '—',
    editoraId: m.editoraId,
    editoraNome: editora?.nome ?? '—',
    anoPublicacao: m.anoPublicacao,
    isbn: m.isbn,
    edicao: m.edicao,
    quantidadePaginas: m.quantidadePaginas,
    sinopse: m.sinopse,
    issn: m.issn,
    tema: m.tema,
    descricao: m.descricao,
    observacao: m.observacao,
    generoIds,
    generoNomes: nomesGeneros || '—',
  };
}

export function iconeTipoMaterial(tipo: string): string {
  switch (tipo) {
    case 'LIVRO':
      return 'bi-book';
    case 'PERIODICO':
      return 'bi-newspaper';
    case 'OUTRO':
      return 'bi-box-seam';
    default:
      return 'bi-collection';
  }
}
