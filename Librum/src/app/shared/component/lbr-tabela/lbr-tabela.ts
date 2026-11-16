import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  computed,
  contentChild,
  Directive,
  inject,
  input,
  linkedSignal,
  signal,
  TemplateRef,
} from '@angular/core';

export const OPCOES_ITENS_POR_PAGINA: readonly number[] = [10, 25, 50];
const JANELA_PAGINAS = 5;

let proximoId = 0;
let proximaColuna = 0;

/** Como obter o valor de ordenação: caminho do campo (`'material.titulo'`) ou uma função. */
export type ValorOrdenacao<T> = string | ((item: T) => unknown);
export type DirecaoOrdenacao = 'asc' | 'desc';

interface Ordenacao<T> {
  coluna: number;
  valor: ValorOrdenacao<T>;
  direcao: DirecaoOrdenacao;
}

const COMPARADOR_TEXTO = new Intl.Collator('pt-BR', { numeric: true, sensitivity: 'base' });

function valorDoItem<T>(item: T, valor: ValorOrdenacao<T>): unknown {
  if (typeof valor === 'function') return valor(item);
  return valor.split('.').reduce<unknown>((atual, parte) => (atual as Record<string, unknown>)?.[parte], item);
}

function estaVazio(valor: unknown): boolean {
  return valor === null || valor === undefined || valor === '';
}

/** Compara textos (com acento e números: "Livro 2" antes de "Livro 10"), números, datas e booleanos. */
function comparar(a: unknown, b: unknown): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b);
  return COMPARADOR_TEXTO.compare(String(a), String(b));
}

export interface LbrTabelaLinhaContexto<T> {
  $implicit: T;
  /** Posição do registro na lista completa (não apenas na página atual). */
  indice: number;
}

/** Marca o template com as colunas do cabeçalho (apenas os `<th>`, sem `<tr>`). */
@Directive({ selector: 'ng-template[lbrTabelaCabecalho]' })
export class LbrTabelaCabecalho {
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}

/**
 * Marca o template de cada linha (incluindo o `<tr>`, para permitir classes por linha).
 * Recebe a mesma lista passada à tabela apenas para tipar o `let-item` no template.
 */
@Directive({ selector: 'ng-template[lbrTabelaLinha]' })
export class LbrTabelaLinha<T> {
  readonly lbrTabelaLinha = input.required<readonly T[]>();
  readonly template = inject<TemplateRef<LbrTabelaLinhaContexto<T>>>(TemplateRef);

  static ngTemplateContextGuard<T>(
    _diretiva: LbrTabelaLinha<T>,
    contexto: unknown,
  ): contexto is LbrTabelaLinhaContexto<T> {
    return true;
  }
}

/**
 * Tabela Bootstrap com paginação no cliente e seleção de itens por página.
 *
 * Uso:
 * ```html
 * <lbr-tabela [dados]="lista" [carregando]="carregando" mensagemVazio="Nada encontrado.">
 *   <ng-template lbrTabelaCabecalho>
 *     <th scope="col">Nome</th>
 *   </ng-template>
 *   <ng-template [lbrTabelaLinha]="lista" let-item>
 *     <tr><td>{{ item.nome }}</td></tr>
 *   </ng-template>
 * </lbr-tabela>
 * ```
 */
@Component({
  selector: 'lbr-tabela',
  imports: [NgTemplateOutlet],
  templateUrl: './lbr-tabela.html',
  styleUrl: './lbr-tabela.scss',
})
export class LbrTabela<T> {
  readonly dados = input<readonly T[]>([]);
  readonly carregando = input(false);
  readonly mensagemCarregando = input('Carregando...');
  readonly mensagemVazio = input('Nenhum registro encontrado.');
  readonly iconeVazio = input('bi-inbox');
  readonly hover = input(true);
  readonly rotulo = input('Paginação da tabela');
  readonly opcoesItensPorPagina = input<readonly number[]>(OPCOES_ITENS_POR_PAGINA);

  protected readonly cabecalho = contentChild.required(LbrTabelaCabecalho);
  protected readonly linha = contentChild.required(LbrTabelaLinha);

  protected readonly idSeletor = `lbr-tabela-itens-${proximoId++}`;

  protected readonly itensPorPagina = linkedSignal(
    () => this.opcoesItensPorPagina()[0] ?? OPCOES_ITENS_POR_PAGINA[0],
  );

  private readonly ordenacao = signal<Ordenacao<T> | null>(null);

  /** Dados na ordem escolhida pelo cabeçalho (vazios sempre no fim). */
  private readonly dadosOrdenados = computed(() => {
    const dados = this.dados();
    const ordenacao = this.ordenacao();
    if (!ordenacao) return dados;
    const sinal = ordenacao.direcao === 'asc' ? 1 : -1;
    return [...dados].sort((itemA, itemB) => {
      const a = valorDoItem(itemA, ordenacao.valor);
      const b = valorDoItem(itemB, ordenacao.valor);
      if (estaVazio(a) || estaVazio(b)) return Number(estaVazio(a)) - Number(estaVazio(b));
      return comparar(a, b) * sinal;
    });
  });

  // Volta para a primeira página quando a quantidade de registros (ex.: filtro), o tamanho da página
  // ou a ordenação muda. A chave é uma string para não reiniciar quando a página recebe um novo array
  // com o mesmo conteúdo.
  protected readonly paginaAtual = linkedSignal({
    source: () => {
      const ordenacao = this.ordenacao();
      return `${this.dados().length}|${this.itensPorPagina()}|${ordenacao?.coluna}:${ordenacao?.direcao}`;
    },
    computation: () => 1,
  });

  protected readonly totalRegistros = computed(() => this.dados().length);

  protected readonly totalPaginas = computed(() =>
    Math.max(1, Math.ceil(this.totalRegistros() / this.itensPorPagina())),
  );

  protected readonly paginaEfetiva = computed(() =>
    Math.min(Math.max(1, this.paginaAtual()), this.totalPaginas()),
  );

  protected readonly indiceInicial = computed(
    () => (this.paginaEfetiva() - 1) * this.itensPorPagina(),
  );

  protected readonly itensPagina = computed(() =>
    this.dadosOrdenados().slice(this.indiceInicial(), this.indiceInicial() + this.itensPorPagina()),
  );

  protected readonly inicioExibicao = computed(() =>
    this.totalRegistros() === 0 ? 0 : this.indiceInicial() + 1,
  );

  protected readonly fimExibicao = computed(() =>
    Math.min(this.indiceInicial() + this.itensPorPagina(), this.totalRegistros()),
  );

  protected readonly paginasVisiveis = computed(() => {
    const total = this.totalPaginas();
    let inicio = Math.max(1, this.paginaEfetiva() - Math.floor(JANELA_PAGINAS / 2));
    const fim = Math.min(total, inicio + JANELA_PAGINAS - 1);
    inicio = Math.max(1, fim - JANELA_PAGINAS + 1);
    return Array.from({ length: fim - inicio + 1 }, (_, indice) => inicio + indice);
  });

  /** Primeiro clique: crescente; clicando de novo na mesma coluna, alterna. */
  ordenarPor(coluna: number, valor: ValorOrdenacao<T>): void {
    const atual = this.ordenacao();
    const direcao: DirecaoOrdenacao = atual?.coluna === coluna && atual.direcao === 'asc' ? 'desc' : 'asc';
    this.ordenacao.set({ coluna, valor, direcao });
  }

  direcaoDaColuna(coluna: number): DirecaoOrdenacao | null {
    const atual = this.ordenacao();
    return atual?.coluna === coluna ? atual.direcao : null;
  }

  irParaPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas()) return;
    this.paginaAtual.set(pagina);
  }

  alterarItensPorPagina(valor: string): void {
    const quantidade = Number(valor);
    if (quantidade > 0) this.itensPorPagina.set(quantidade);
  }
}

/**
 * Cabeçalho que ordena a tabela ao ser clicado (crescente ↑ / decrescente ↓).
 * Use dentro do `<ng-template lbrTabelaCabecalho>`:
 *
 * ```html
 * <th scope="col" lbrOrdenar="titulo">Título</th>
 * <th scope="col" [lbrOrdenar]="porSituacao">Status</th>
 * ```
 */
@Component({
  selector: 'th[lbrOrdenar]',
  template: `
    <button type="button" class="lbr-ordenar" (click)="alternar()" [attr.title]="dica()">
      <ng-content />
      <span class="lbr-ordenar__setas" aria-hidden="true">
        <i class="bi bi-arrow-up" [class.ativa]="direcao() === 'asc'"></i><i class="bi bi-arrow-down" [class.ativa]="direcao() === 'desc'"></i>
      </span>
    </button>
  `,
  styles: `
    .lbr-ordenar {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0;
      border: 0;
      background: none;
      color: inherit;
      font: inherit;
      letter-spacing: inherit;
      text-transform: inherit;
      white-space: nowrap;
      cursor: pointer;
    }
    .lbr-ordenar:focus-visible {
      outline: 2px solid var(--bs-primary);
      outline-offset: 2px;
      border-radius: 0.25rem;
    }
    /* duas setinhas lado a lado: a da direção atual fica forte, a outra apagada */
    .lbr-ordenar__setas {
      display: inline-flex;
      font-size: 0.85em;
      letter-spacing: -0.2em;
    }
    .lbr-ordenar__setas i {
      opacity: 0.45;
      -webkit-text-stroke: 0.4px currentColor;
    }
    .lbr-ordenar:hover .lbr-ordenar__setas i {
      opacity: 0.7;
    }
    .lbr-ordenar__setas i.ativa {
      opacity: 1;
    }
    .lbr-ordenar__setas:has(.ativa) i:not(.ativa) {
      opacity: 0.25;
    }
  `,
  host: { '[attr.aria-sort]': 'ariaSort()' },
})
export class LbrTabelaOrdenar<T> {
  readonly lbrOrdenar = input.required<ValorOrdenacao<T>>();

  private readonly tabela = inject<LbrTabela<T>>(LbrTabela);
  private readonly coluna = proximaColuna++;

  protected readonly direcao = computed(() => this.tabela.direcaoDaColuna(this.coluna));
  protected readonly ariaSort = computed(() =>
    this.direcao() === 'asc' ? 'ascending' : this.direcao() === 'desc' ? 'descending' : 'none',
  );
  protected readonly dica = computed(() =>
    this.direcao() === 'asc' ? 'Ordenado em ordem crescente. Clique para decrescente.' : 'Clique para ordenar',
  );

  protected alternar(): void {
    this.tabela.ordenarPor(this.coluna, this.lbrOrdenar());
  }
}
