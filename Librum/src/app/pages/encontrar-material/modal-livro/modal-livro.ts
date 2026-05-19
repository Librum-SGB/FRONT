import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Exemplar } from '../../../models/exemplar.model';
import { Modal } from '../../../shared/component/modal/modal';
import { Livro } from '../../../models/livro.model';
import { ExemplarVirtualDto, LivroVirtualDto } from '../../../dto/estantevirtual.dto';

@Component({
  selector: 'app-modal-livro',
  imports: [Modal],
  templateUrl: './modal-livro.html',
  styleUrl: './modal-livro.scss',
})
export class ModalLivro {
  @Input() isOpen: boolean = false;
  @Input() exemplar?: ExemplarVirtualDto;
  @Output() isOpenChange = new EventEmitter<boolean>();

  close() {
    this.isOpenChange.emit(false);
  }
}
