import { Component, input } from '@angular/core';

/**
 * Mensagem centralizada com ícone, para listas vazias e telas que não conseguiram carregar.
 * Um botão/link opcional pode ser colocado dentro (ex.: "Voltar para materiais").
 *
 * ```html
 * <lbr-aviso icone="bi-exclamation-circle" [mensagem]="erro()">
 *   <a lbrButton variant="outros" routerLink="/editarExcluirMaterial">Voltar para materiais</a>
 * </lbr-aviso>
 * ```
 */
@Component({
  selector: 'lbr-aviso',
  template: `
    <div class="text-center py-5 border border-secondary border-opacity-25 rounded">
      <i class="bi {{ icone() }} fs-1 text-secondary opacity-50" aria-hidden="true"></i>
      <p class="text-secondary mt-2 mb-0">{{ mensagem() }}</p>
      <div class="acoes mt-3"><ng-content /></div>
    </div>
  `,
  // sem botão dentro, a área de ações some
  styles: '.acoes:empty { display: none; }',
})
export class LbrAviso {
  readonly mensagem = input.required<string>();
  readonly icone = input('bi-exclamation-circle');
}
