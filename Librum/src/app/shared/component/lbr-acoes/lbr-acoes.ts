import { Component, computed, input } from '@angular/core';
import { Params, RouterLink } from '@angular/router';

export interface AcaoMenu {
  rotulo: string;
  /** Classe do Bootstrap Icons, ex.: `bi-pencil`. */
  icone?: string;
  /** Navega para a rota (vira um link). */
  rota?: readonly unknown[] | string;
  queryParams?: Params;
  /** Executa a ação (vira um botão). */
  executar?: () => void;
  /** Ação destrutiva: aparece em vermelho. */
  perigo?: boolean;
  /** Linha separadora antes desta ação. */
  separadorAntes?: boolean;
  /** `false` esconde a ação (ex.: sem permissão). */
  visivel?: boolean;
  desabilitado?: boolean;
  /** Explica por que a ação está desabilitada. */
  dica?: string;
}

/**
 * Botão "⋮" que abre um menu com as ações de um registro (última coluna das tabelas).
 *
 * ```html
 * <lbr-acoes [acoes]="acoesDoMaterial(material)" />
 * ```
 */
@Component({
  selector: 'lbr-acoes',
  imports: [RouterLink],
  templateUrl: './lbr-acoes.html',
  styleUrl: './lbr-acoes.scss',
})
export class LbrAcoes {
  readonly acoes = input.required<AcaoMenu[]>();
  /** Nome do registro, usado no rótulo acessível do botão ("Ações de Dom Casmurro"). */
  readonly descricao = input('');

  protected readonly visiveis = computed(() => this.acoes().filter((acao) => acao.visivel !== false));

  protected readonly rotuloBotao = computed(() =>
    this.descricao() ? `Ações de ${this.descricao()}` : 'Mais ações',
  );
}
