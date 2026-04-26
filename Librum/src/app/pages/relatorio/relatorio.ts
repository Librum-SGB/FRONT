import { Component } from '@angular/core';
import { TipoRelatorio } from '../../enum/tipo-relatorio.enum';

@Component({
  selector: 'app-relatorio',
  imports: [],
  templateUrl: './relatorio.html',
  styleUrl: './relatorio.scss',
})
export class Relatorio {
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

  onCheckboxChange(event: any, id: number) {
    if (event.target.checked) {
      this.selectedTipos.push(id);
    } else {
      this.selectedTipos = this.selectedTipos.filter((t) => t !== id);
    }
  }
}
