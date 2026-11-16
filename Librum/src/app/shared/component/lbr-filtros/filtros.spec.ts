import {
  ConfigFiltro,
  correspondeBusca,
  filtrarItens,
  normalizar,
  opcoesDosItens,
  temFiltroAtivo,
} from './filtros';

interface Livro {
  id: number;
  titulo: string;
  autor: string;
  generoIds: number[];
  tipo: string;
  aquisicao?: string;
  cpf?: string;
}

const LIVROS: Livro[] = [
  { id: 1, titulo: 'Dom Casmurro', autor: 'Machado de Assis', generoIds: [1], tipo: 'LIVRO', aquisicao: '2024-03-10' },
  { id: 2, titulo: 'Memórias Póstumas', autor: 'Machado de Assis', generoIds: [1, 2], tipo: 'LIVRO', aquisicao: '2025-01-05' },
  { id: 3, titulo: 'Revista Ciência', autor: 'Vários', generoIds: [3], tipo: 'PERIODICO' },
  { id: 4, titulo: 'O Cortiço', autor: 'Aluísio Azevedo', generoIds: [2], tipo: 'LIVRO', aquisicao: '2023-07-20', cpf: '52998224725' },
];

const CONFIG: ConfigFiltro<Livro> = {
  busca: (l) => [l.id, l.titulo, l.autor, l.cpf],
  campos: [
    { tipo: 'opcoes', chave: 'tipo', rotulo: 'Tipo', valorDoItem: (l) => l.tipo, opcoes: [] },
    { tipo: 'lista', chave: 'genero', rotulo: 'Gênero', valorDoItem: (l) => l.generoIds, opcoes: [] },
    { tipo: 'periodo', chave: 'aquisicao', rotulo: 'Aquisição', valorDoItem: (l) => l.aquisicao },
  ],
};

const ids = (itens: Livro[]) => itens.map((l) => l.id);

describe('filtros', () => {
  describe('busca', () => {
    it('ignora acentos e maiúsculas', () => {
      expect(normalizar('  Memórias PÓSTUMAS ')).toBe('memorias postumas');
      expect(ids(filtrarItens(LIVROS, CONFIG, { busca: 'memorias' }))).toEqual([2]);
      expect(ids(filtrarItens(LIVROS, CONFIG, { busca: 'CORTICO' }))).toEqual([4]);
    });

    it('aceita várias palavras em qualquer ordem e em campos diferentes', () => {
      expect(ids(filtrarItens(LIVROS, CONFIG, { busca: 'assis dom' }))).toEqual([1]);
      expect(ids(filtrarItens(LIVROS, CONFIG, { busca: 'machado' }))).toEqual([1, 2]);
    });

    it('encontra números com ou sem pontuação (CPF) e IDs com #', () => {
      expect(correspondeBusca(['52998224725'], '529.982.247-25')).toBe(true);
      expect(ids(filtrarItens(LIVROS, CONFIG, { busca: '#3' }))).toEqual([3]);
    });

    it('busca vazia não filtra', () => {
      expect(filtrarItens(LIVROS, CONFIG, { busca: '   ' })).toHaveLength(4);
    });
  });

  describe('campos', () => {
    it('dentro do mesmo filtro vale qualquer um dos valores (OU)', () => {
      expect(ids(filtrarItens(LIVROS, CONFIG, { genero: ['1', '3'] }))).toEqual([1, 2, 3]);
    });

    it('filtros diferentes se somam (E)', () => {
      expect(ids(filtrarItens(LIVROS, CONFIG, { genero: ['2'], tipo: ['LIVRO'], busca: 'machado' }))).toEqual([2]);
    });

    it('período é inclusivo e exclui itens sem data quando há limite', () => {
      expect(ids(filtrarItens(LIVROS, CONFIG, { aquisicaoDe: '2024-03-10' }))).toEqual([1, 2]);
      expect(ids(filtrarItens(LIVROS, CONFIG, { aquisicaoAte: '2024-03-10' }))).toEqual([1, 4]);
      expect(ids(filtrarItens(LIVROS, CONFIG, { aquisicaoDe: '2024-01-01', aquisicaoAte: '2024-12-31' }))).toEqual([1]);
    });
  });

  it('temFiltroAtivo ignora valores vazios', () => {
    expect(temFiltroAtivo({})).toBe(false);
    expect(temFiltroAtivo({ busca: '  ', genero: [] })).toBe(false);
    expect(temFiltroAtivo({ genero: ['1'] })).toBe(true);
  });

  it('opcoesDosItens gera opções únicas e em ordem alfabética', () => {
    expect(opcoesDosItens(LIVROS, (l) => l.autor)).toEqual([
      { valor: 'Aluísio Azevedo', rotulo: 'Aluísio Azevedo' },
      { valor: 'Machado de Assis', rotulo: 'Machado de Assis' },
      { valor: 'Vários', rotulo: 'Vários' },
    ]);
  });
});
