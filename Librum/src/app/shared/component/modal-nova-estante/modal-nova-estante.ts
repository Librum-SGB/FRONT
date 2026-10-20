import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EstanteRequestDto } from '../../../dto/estantevirtual.dto';
import { FormsModule } from '@angular/forms';
import { LbrButtom } from '../lbr-buttom/lbr-buttom';

@Component({
  selector: 'app-modal-nova-estante',
  imports: [FormsModule, LbrButtom],
  templateUrl: './modal-nova-estante.html',
  styleUrl: './modal-nova-estante.scss',
})
export class ModalNovaEstante {
  @Input() isOpen = false;
  @Input() salvando = false;
  @Input() erro?: string;
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() estanteCriada = new EventEmitter<EstanteRequestDto>();

  nome: string = '';
  localizacao: string = '';
  capacidade?: number;
  qtdPrateleiras: number = 3;

  fechar() {
    this.isOpen = false;
    this.isOpenChange.emit(false);
    this.resetForm();
  }

  salvar() {
    if (
      this.salvando ||
      !this.nome.trim() ||
      !this.localizacao.trim() ||
      !Number.isInteger(this.qtdPrateleiras) ||
      this.qtdPrateleiras < 1
    ) {
      return;
    }

    const novaEstante: EstanteRequestDto = {
      nome: this.nome.trim(),
      localizacao: this.localizacao.trim(),
      capacidade: this.capacidade,
      qtdPrateleiras: this.qtdPrateleiras,
    };

    this.estanteCriada.emit(novaEstante);
  }

  private resetForm() {
    this.nome = '';
    this.localizacao = '';
    this.capacidade = undefined;
    this.qtdPrateleiras = 3;
  }
}
