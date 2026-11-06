import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { switchMap } from 'rxjs';
import { prioridade } from '../../enum/prioridade.enum';
import { StatusTarefa } from '../../enum/status.enum';
import { Tarefa, TarefaRequest } from '../../models/tarefa.model';
import { AuthService } from '../../services/auth.service';
import { DashboardMetricas, DashboardService } from '../../services/dashboard.service';
import { Badge } from '../../shared/component/badge/badge';
import { BotaoAcaoRapida } from '../../shared/component/botao-acao-rapida/botao-acao-rapida';
import { CardInformativo } from '../../shared/component/card/card-informativo/card-informativo';
import { CardStatus } from '../../shared/component/card/card-status/card-status';
import { CorpoPadrao } from '../../shared/component/corpo-padrao/corpo-padrao';
import { ItemListaTarefa } from '../../shared/component/item-lista-tarefa/item-lista-tarefa';
import { ConfiguracaoService } from '../../shared/services/configuracao.service';
import { TarefaService } from '../../shared/services/tarefas.service';

declare var bootstrap: any;

@Component({
  selector: 'app-dashboard',
  imports: [
    ItemListaTarefa,
    CardInformativo,
    CardStatus,
    BotaoAcaoRapida,
    FormsModule,
    Badge,
    CorpoPadrao,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  listaTarefa: Tarefa[] = [];
  descNovaTarefa = '';
  tarefaSelecionada: Tarefa | null = null;
  exibeAcaoRapida = false;
  exibeIndicadores = false;
  carregandoTarefas = true;
  carregandoIndicadores = false;
  salvandoTarefaId: number | null = null;
  salvandoNovaTarefa = false;
  erroTarefas = '';
  erroIndicadores = '';
  metricas: DashboardMetricas | null = null;

  constructor(
    private readonly tarefaService: TarefaService,
    private readonly configuracaoService: ConfiguracaoService,
    private readonly dashboardService: DashboardService,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.exibeIndicadores = this.authService.isTeamMember();
    this.exibeAcaoRapida = this.configuracaoService.configuracaoAtivaByChave(
      ConfiguracaoService.CHAVE_ACAO_RAPIDA,
      1,
    );
    this.carregarTarefas();

    if (this.exibeIndicadores) {
      this.carregarIndicadores();
    }
  }

  adicionarTarefa(): void {
    const descricao = this.descNovaTarefa.trim();
    if (!descricao || this.salvandoNovaTarefa) return;

    this.erroTarefas = '';
    this.salvandoNovaTarefa = true;
    this.tarefaService
      .create({
        descricao,
        prioridade: prioridade.MEDIA,
        status: StatusTarefa.PENDENTE,
      })
      .subscribe({
        next: (tarefa) => {
          this.listaTarefa = [tarefa, ...this.listaTarefa];
          this.descNovaTarefa = '';
          this.salvandoNovaTarefa = false;
        },
        error: () => {
          this.erroTarefas = 'Não foi possível salvar a tarefa. Tente novamente.';
          this.salvandoNovaTarefa = false;
        },
      });
  }

  toggleTarefa(id: number): void {
    const tarefa = this.listaTarefa.find((item) => item.id === id);
    if (!tarefa || this.salvandoTarefaId !== null) return;

    const payload: TarefaRequest = {
      usuarioId: tarefa.usuarioId,
      descricao: tarefa.descricao,
      prioridade: tarefa.prioridade,
      status:
        tarefa.status === StatusTarefa.CONCLUIDA
          ? StatusTarefa.PENDENTE
          : StatusTarefa.CONCLUIDA,
      prazo: tarefa.prazo,
    };

    this.erroTarefas = '';
    this.salvandoTarefaId = id;
    this.tarefaService.update(id, payload).subscribe({
      next: (atualizada) => {
        this.listaTarefa = this.listaTarefa.map((item) =>
          item.id === id ? atualizada : item,
        );
        this.salvandoTarefaId = null;
      },
      error: () => {
        this.erroTarefas = 'Não foi possível atualizar a tarefa. Tente novamente.';
        this.salvandoTarefaId = null;
      },
    });
  }

  abrirConfirmacaoExclusaoTarefa(id: number): void {
    this.tarefaSelecionada = this.listaTarefa.find((tarefa) => tarefa.id === id) ?? null;
    if (!this.tarefaSelecionada) return;

    new bootstrap.Modal(document.getElementById('excluirTarefaModal')).show();
  }

  confirmarExclusaoTarefa(): void {
    const tarefa = this.tarefaSelecionada;
    if (!tarefa || this.salvandoTarefaId !== null) return;

    this.erroTarefas = '';
    this.salvandoTarefaId = tarefa.id;
    this.tarefaService.delete(tarefa.id).subscribe({
      next: () => {
        this.listaTarefa = this.listaTarefa.filter((item) => item.id !== tarefa.id);
        this.tarefaSelecionada = null;
        this.salvandoTarefaId = null;
        bootstrap.Modal.getInstance(document.getElementById('excluirTarefaModal'))?.hide();
      },
      error: () => {
        this.erroTarefas = 'Não foi possível excluir a tarefa. Tente novamente.';
        this.salvandoTarefaId = null;
      },
    });
  }

  private carregarTarefas(): void {
    this.erroTarefas = '';
    this.dashboardService
      .getUsuarioAtual()
      .pipe(
        switchMap((usuario) =>
          this.tarefaService.findByUserId(usuario.id),
        ),
      )
      .subscribe({
        next: (tarefas) => {
          this.listaTarefa = tarefas;
          this.carregandoTarefas = false;
        },
        error: () => {
          this.erroTarefas = 'Não foi possível carregar o checklist.';
          this.carregandoTarefas = false;
        },
      });
  }

  private carregarIndicadores(): void {
    this.carregandoIndicadores = true;
    this.erroIndicadores = '';
    this.dashboardService.getMetricas().subscribe({
      next: (metricas) => {
        this.metricas = metricas;
        this.carregandoIndicadores = false;
      },
      error: () => {
        this.erroIndicadores = 'Não foi possível carregar os indicadores do acervo.';
        this.carregandoIndicadores = false;
      },
    });
  }
}
