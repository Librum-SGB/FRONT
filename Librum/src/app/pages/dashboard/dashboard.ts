import { Component, OnInit } from '@angular/core';
import { ItemListaTarefa } from '../../shared/component/item-lista-tarefa/item-lista-tarefa';
import { CardInformativo } from '../../shared/component/card/card-informativo/card-informativo';
import { CardStatus } from '../../shared/component/card/card-status/card-status';
import { NgClass } from '@angular/common';
import { BotaoAcaoRapida } from '../../shared/component/botao-acao-rapida/botao-acao-rapida';
import { FormsModule } from '@angular/forms';
import { Tarefa } from '../../models/tarefa.model';
import { TarefaService } from '../../shared/services/tarefas.service';
import { prioridade } from '../../enum/prioridade.enum';
import { Badge } from '../../shared/component/badge/badge';

@Component({
  selector: 'app-dashboard',
  imports: [ItemListaTarefa, CardInformativo, CardStatus, BotaoAcaoRapida, FormsModule, Badge],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  listaTarefa: Tarefa[] = [];
  descNovaTarefa: string = '';
  constructor(private tarefaService: TarefaService) {}

  ngOnInit(): void {
    this.listaTarefa = this.tarefaService.getTarefas();
  }

  adicionarTarefa() {
    if (!this.descNovaTarefa.trim()) return;
    const novaTarefa: Tarefa = {
      gestorId: 1, // ou do usuário logado
      descricao: this.descNovaTarefa,
      prioridade: prioridade.MEDIA,
      concluida: false,
      dataCriacao: new Date(),
      dataUltimaAtualizacao: new Date(),
    };
    this.tarefaService.adicionarTarefa(novaTarefa);
    this.listaTarefa = this.tarefaService.getTarefas(); // 🔥 AQUI
    this.descNovaTarefa = '';
  }

  toggleTarefa(id: number) {
    this.tarefaService.alternarConclusao(id);
    this.listaTarefa = this.tarefaService.getTarefas();
  }

  deletarTarefa(id: number) {
    this.tarefaService.removerTarefa(id);
    this.listaTarefa = this.tarefaService.getTarefas();
  }
}
