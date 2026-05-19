import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Tarefa } from '../../../models/tarefa.model';
import { prioridade } from '../../../enum/prioridade.enum';
@Component({
  selector: 'app-item-lista-tarefa',
  imports: [NgClass],
  templateUrl: './item-lista-tarefa.html',
  styleUrl: './item-lista-tarefa.scss',
})
export class ItemListaTarefa {
  @Input({ required: true }) tarefa!: Tarefa;

  @Output() mudarEstado = new EventEmitter<number>();
  @Output() deletar = new EventEmitter<number>();

  onCheckEvent() {
    this.mudarEstado.emit(this.tarefa.id!);
  }

  onDelete() {
    this.deletar.emit(this.tarefa.id!);
  }

  getBadgeColor(p?: prioridade): string {
    if (!p) return 'secondary';
    switch (p) {
      case prioridade.BAIXA:
        return 'bg-success-subtle text-success';

      case prioridade.MEDIA:
        return 'bg-primary-subtle text-primary';

      case prioridade.ALTA:
        return 'bg-warning-subtle text-warning';

      case prioridade.URGENTE:
        return 'bg-danger-subtle text-danger';

      default:
        return 'bg-secondary-subtle text-secondary';
    }
  }
}
