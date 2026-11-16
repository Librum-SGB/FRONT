import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  computed,
  contentChild,
  Directive,
  inject,
  input,
  linkedSignal,
  TemplateRef,
} from '@angular/core';

export const OPCOES_ITENS_POR_PAGINA: readonly number[] = [10, 25, 50];
const JANELA_PAGINAS = 5;

let proximoId = 0;

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

  // Volta para a primeira página quando a quantidade de registros (ex.: filtro) ou o tamanho da página muda.
  // A chave é uma string para não reiniciar quando a página recebe um novo array com o mesmo conteúdo.
  protected readonly paginaAtual = linkedSignal({
    source: () => `${this.dados().length}|${this.itensPorPagina()}`,
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
    this.dados().slice(this.indiceInicial(), this.indiceInicial() + this.itensPorPagina()),
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

  irParaPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas()) return;
    this.paginaAtual.set(pagina);
  }

  alterarItensPorPagina(valor: string): void {
    const quantidade = Number(valor);
    if (quantidade > 0) this.itensPorPagina.set(quantidade);
  }
}
