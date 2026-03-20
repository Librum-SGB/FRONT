import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass } from '@angular/common';
@Component({
  selector: 'app-item-lista-tarefa',
  imports: [NgClass],
  templateUrl: './item-lista-tarefa.html',
  styleUrl: './item-lista-tarefa.scss',
})
export class ItemListaTarefa {
  @Input({ required: true }) descricao: string = 'descricao';
  @Input({ required: false }) concluida: boolean = false;

  @Output() mudarEstado = new EventEmitter<boolean>();
  @Output() deletar = new EventEmitter<void>();

  onCheckEvent(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.mudarEstado.emit(checked);
  }

  onDelete() {
    this.deletar.emit();
  }
}
