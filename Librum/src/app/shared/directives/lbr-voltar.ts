import { Directive, HostListener, inject, input } from '@angular/core';

import { NavegacaoService } from '../services/navegacao.service';

/**
 * Faz um botão voltar para a tela de onde a pessoa veio (ou para o destino padrão informado).
 *
 * ```html
 * <button type="button" lbrButton variant="cancelar" lbrVoltar="/editarExcluirMaterial">Voltar</button>
 * ```
 */
@Directive({ selector: '[lbrVoltar]' })
export class LbrVoltar {
  /** Destino quando não há tela anterior no sistema (ex.: link aberto direto). */
  readonly lbrVoltar = input.required<string | readonly unknown[]>();

  private readonly navegacao = inject(NavegacaoService);

  @HostListener('click', ['$event'])
  protected voltar(evento: Event): void {
    evento.preventDefault();
    this.navegacao.voltar(this.lbrVoltar());
  }
}
