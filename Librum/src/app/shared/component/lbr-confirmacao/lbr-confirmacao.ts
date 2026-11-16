import { Component, effect, ElementRef, inject, viewChild } from '@angular/core';

import { ConfirmacaoService } from '../../services/confirmacao.service';
import { Modal } from '../modal/modal';

/**
 * Exibe os pedidos do ConfirmacaoService no modal padrão (`app-modal`).
 * Deve existir uma única vez, em app.html.
 */
@Component({
  selector: 'lbr-confirmacao',
  imports: [Modal],
  templateUrl: './lbr-confirmacao.html',
  styleUrl: './lbr-confirmacao.scss',
})
export class LbrConfirmacao {
  protected readonly servico = inject(ConfirmacaoService);
  private readonly botaoConfirmar = viewChild<ElementRef<HTMLButtonElement>>('botaoConfirmar');

  constructor() {
    // Ao abrir, o foco vai para "Confirmar" (Enter confirma; Esc ou X cancelam).
    effect(() => {
      if (this.servico.pedidoAtual()) {
        setTimeout(() => this.botaoConfirmar()?.nativeElement.focus());
      }
    });
  }
}
