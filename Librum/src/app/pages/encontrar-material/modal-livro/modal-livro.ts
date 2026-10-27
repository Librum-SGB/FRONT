import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Modal } from '../../../shared/component/modal/modal';
import { ExemplarVirtualDto } from '../../../dto/estantevirtual.dto';
import { LbrButtom } from '../../../shared/component/lbr-buttom/lbr-buttom';

@Component({
  selector: 'app-modal-livro',
  imports: [Modal, LbrButtom],
  templateUrl: './modal-livro.html',
  styleUrl: './modal-livro.scss',
})
export class ModalLivro {
  @Input() isOpen: boolean = false;
  @Input() exemplar?: ExemplarVirtualDto;
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() editarMaterial = new EventEmitter<number>();
  @Output() editarLocalizacao = new EventEmitter<ExemplarVirtualDto>();
  @Output() removerDaEstante = new EventEmitter<ExemplarVirtualDto>();

  get tipoMaterialLabel(): string {
    switch (this.exemplar?.material.tipo) {
      case 'LIVRO':
        return 'Livro';
      case 'PERIODICO':
        return 'Periódico';
      case 'OUTRO':
        return 'Outros Materiais';
      default:
        return this.exemplar?.material.tipo ?? '';
    }
  }

  close() {
    this.isOpenChange.emit(false);
  }
}
