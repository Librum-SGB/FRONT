import { Component } from '@angular/core';
import { ItemListaTarefa } from '../../componentes/item-lista-tarefa/item-lista-tarefa';
import { CardInformativo } from '../../componentes/card/card-informativo/card-informativo';
import { CardStatus } from '../../componentes/card/card-status/card-status';
import { NgClass } from '@angular/common';
import { BotaoAcaoRapida } from '../../componentes/botao-acao-rapida/botao-acao-rapida';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  imports: [ItemListaTarefa, CardInformativo, CardStatus, NgClass, BotaoAcaoRapida, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  novaTarefa: string = '';

  adicionarTarefa() {
    if (!this.novaTarefa.trim()) return;
    this.tarefas.push({ descricao: this.novaTarefa, concluida: false });
    this.novaTarefa = '';
  }

  atualizarTarefa(index: number, concluida: boolean) {
    this.tarefas[index].concluida = concluida;
  }

  deletarTarefa(index: number) {
    this.tarefas.splice(index, 1);
  }

  tarefas = [
    {
      descricao: 'Estudar JavaScript',
      concluida: true,
    },
    {
      descricao: 'Fazer exercícios',
      concluida: false,
    },
    {
      descricao: 'Ler um livro',
      concluida: false,
    },
    {
      descricao: 'Organizar o quarto',
      concluida: true,
    },
  ];
}
