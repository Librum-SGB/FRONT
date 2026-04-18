import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Exemplar } from '../../../models/exemplar.model';
import { Modal } from '../../../shared/component/modal/modal';

@Component({
  selector: 'app-modal-livro',
  imports: [Modal],
  templateUrl: './modal-livro.html',
  styleUrl: './modal-livro.scss',
})
export class ModalLivro {
  @Input() isOpen: boolean = false;
  @Input() livro?: Exemplar;
  @Output() isOpenChange = new EventEmitter<boolean>();

  close() {
    this.isOpenChange.emit(false);
  }
}
