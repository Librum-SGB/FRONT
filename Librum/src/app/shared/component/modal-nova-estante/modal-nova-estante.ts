import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EstanteVirtualDto, PrateleiraVirtualDto } from '../../../dto/estantevirtual.dto';
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
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() estanteCriada = new EventEmitter<Partial<EstanteVirtualDto>>();

  localizacao: string = '';
  capacidade?: number;
  qtdPrateleiras: number = 3;

  fechar() {
    this.isOpen = false;
    this.isOpenChange.emit(false);
    this.resetForm();
  }

  salvar() {
    if (!this.localizacao.trim()) return;

    // Gera o array inicial de prateleiras (ex: A1, A2, A3 ou P1, P2...)
    const prateleiras: PrateleiraVirtualDto[] = Array.from(
      { length: this.qtdPrateleiras },
      (_, index) => ({
        nome: `Prateleira ${index + 1}`,
        exemplares: [],
      }),
    );

    const novaEstante: Partial<EstanteVirtualDto> = {
      localizacao: this.localizacao,
      capacidade: this.capacidade,
      prateleiras,
    };

    this.estanteCriada.emit(novaEstante);
    this.fechar();
  }

  private resetForm() {
    this.localizacao = '';
    this.capacidade = undefined;
    this.qtdPrateleiras = 3;
  }
}
