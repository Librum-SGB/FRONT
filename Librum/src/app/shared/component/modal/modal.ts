import { NgClass } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

let proximoId = 0;

/**
 * Modal padrão do sistema: centralizado, com o fundo escurecido e levemente desfocado.
 * Fecha pelo X, pelo Esc e (opcionalmente) clicando fora.
 *
 * ```html
 * <app-modal title="Cadastrar Gênero" [isOpen]="aberta" (isOpenChange)="aberta = $event"> ... </app-modal>
 * ```
 * Para um rodapé próprio, use `[showDefaultFooter]="false"` e um elemento com o atributo `modal-footer`.
 */
@Component({
  selector: 'app-modal',
  imports: [NgClass],
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
})
export class Modal {
  @Input() title: string = '';
  @Input() isOpen: boolean = false;
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() showDefaultFooter = true;
  /** Ícone opcional ao lado do título (classe do Bootstrap Icons, ex.: `bi-arrow-repeat`). */
  @Input() icone = '';
  /** Cor do ícone: primary, success, warning, danger, secondary. */
  @Input() tom = 'primary';
  /** Fechar ao clicar no fundo escurecido. */
  @Input() fecharAoClicarFora = false;

  @Output() isOpenChange = new EventEmitter<boolean>();

  protected readonly idTitulo = `app-modal-titulo-${proximoId++}`;

  close() {
    this.isOpenChange.emit(false);
  }

  protected clicouNoFundo(evento: MouseEvent): void {
    // Só fecha se o clique foi no fundo, e não dentro da janela.
    if (this.fecharAoClicarFora && evento.target === evento.currentTarget) this.close();
  }

  @HostListener('document:keydown.escape')
  protected fecharComEsc(): void {
    if (this.isOpen) this.close();
  }
}
