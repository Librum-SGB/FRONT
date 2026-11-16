import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NavegacaoService } from '../../services/navegacao.service';

export interface DestinoTrilha {
  rotulo: string;
  rota: string | readonly unknown[];
}

/**
 * Caminho (breadcrumb) que mostra a tela de onde a pessoa veio ("Realizar Empréstimo › Dom Casmurro").
 * Se a tela foi aberta direto pelo link, mostra o destino padrão (ex.: a listagem).
 *
 * ```html
 * <lbr-trilha [atual]="material.titulo" [padrao]="{ rotulo: 'Materiais', rota: '/editarExcluirMaterial' }" />
 * ```
 */
@Component({
  selector: 'lbr-trilha',
  imports: [RouterLink],
  template: `
    <nav aria-label="Caminho" class="mb-4">
      <ol class="breadcrumb mb-0">
        @if (navegacao.origem(); as origem) {
          <li class="breadcrumb-item">
            <a [href]="origem.url" (click)="voltar($event)">{{ origem.titulo || 'Voltar' }}</a>
          </li>
        } @else {
          <li class="breadcrumb-item"><a [routerLink]="padrao().rota">{{ padrao().rotulo }}</a></li>
        }
        <li class="breadcrumb-item active" aria-current="page">{{ atual() }}</li>
      </ol>
    </nav>
  `,
})
export class LbrTrilha {
  readonly atual = input.required<string>();
  /** Usado quando não há tela anterior no sistema. */
  readonly padrao = input.required<DestinoTrilha>();

  protected readonly navegacao = inject(NavegacaoService);

  protected voltar(evento: Event): void {
    evento.preventDefault();
    this.navegacao.voltar(this.padrao().rota);
  }
}
