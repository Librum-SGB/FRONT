import { Component } from '@angular/core';
import { TipoRelatorio } from '../../enum/tipo-relatorio.enum';
import { NgClass } from '@angular/common';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-relatorio',
  imports: [NgClass],
  templateUrl: './relatorio.html',
  styleUrl: './relatorio.scss',
})
export class Relatorio {
  constructor(private toastService: ToastService) {}

  selectedTipos: number[] = [];

  tiposRelatorio = [
    { id: TipoRelatorio.Usuario, nome: 'Usuário' },
    { id: TipoRelatorio.Emprestimo, nome: 'Empréstimo' },
    { id: TipoRelatorio.Acervo, nome: 'Acervo' },
    { id: TipoRelatorio.Bloqueio, nome: 'Bloqueio' },
    { id: TipoRelatorio.Devolucao, nome: 'Devoluções' },
    { id: TipoRelatorio.Reservas, nome: 'Reservas' },
    { id: TipoRelatorio.Penalidades, nome: 'Penalidades' },
    { id: TipoRelatorio.Estatisticas, nome: 'Estatísticas' },
  ];

  gerarRelatorio() {
    if (this.selectedTipos.length <= 0) {
      this.toastService.showError('Selecione tipos de dados para gerar relatórios');
      return;
    }
    this.toastService.showSuccess('Relatório gerado');
  }

  onCheckboxChange(event: any, id: number) {
    if (event.target.checked) {
      this.selectedTipos.push(id);
    } else {
      this.selectedTipos = this.selectedTipos.filter((t) => t !== id);
    }
  }
}
