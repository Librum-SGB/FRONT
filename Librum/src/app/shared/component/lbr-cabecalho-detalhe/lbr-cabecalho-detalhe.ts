import { Component, input } from '@angular/core';

/**
 * Topo das telas de detalhe: ícone, título, uma linha de informações e os botões de ação.
 *
 * ```html
 * <lbr-cabecalho-detalhe icone="bi-book" [titulo]="material.titulo">
 *   <ng-container subtitulo>L-00007 · <lbr-badge ...>Livro</lbr-badge></ng-container>
 *   <ng-container acoes><button ...>Voltar</button> ...</ng-container>
 * </lbr-cabecalho-detalhe>
 * ```
 */
@Component({
  selector: 'lbr-cabecalho-detalhe',
  template: `
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-3 mb-4">
      <div class="d-flex align-items-center gap-3 min-w-0">
        <span class="icone rounded-circle bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center flex-shrink-0"
          aria-hidden="true">
          <i class="bi {{ icone() }} fs-2"></i>
        </span>
        <div class="min-w-0">
          <h2 class="h4 mb-1">{{ titulo() }}</h2>
          <div class="d-flex flex-wrap align-items-center gap-2 text-muted small">
            <ng-content select="[subtitulo]" />
          </div>
        </div>
      </div>
      <div class="d-flex flex-wrap gap-2 flex-shrink-0">
        <ng-content select="[acoes]" />
      </div>
    </div>
  `,
  styles: `
    .icone {
      width: 4rem;
      height: 4rem;
    }
    .min-w-0 {
      min-width: 0;
    }
  `,
})
export class LbrCabecalhoDetalhe {
  readonly titulo = input.required<string>();
  readonly icone = input.required<string>();
}
