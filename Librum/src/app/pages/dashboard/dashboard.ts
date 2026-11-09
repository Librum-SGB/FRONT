import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ItemListaTarefa } from '../../shared/component/item-lista-tarefa/item-lista-tarefa';
import { CardInformativo } from '../../shared/component/card/card-informativo/card-informativo';
import { CardStatus } from '../../shared/component/card/card-status/card-status';
import { BotaoAcaoRapida } from '../../shared/component/botao-acao-rapida/botao-acao-rapida';
import { FormsModule } from '@angular/forms';
import { Tarefa } from '../../models/tarefa.model';
import { TarefaService } from '../../shared/services/tarefas.service';
import { Badge } from '../../shared/component/badge/badge';
import { ConfiguracaoService } from '../../shared/services/configuracao.service';
import { CorpoPadrao } from '../../shared/component/corpo-padrao/corpo-padrao';
import { DashboardResumo, DashboardService } from '../../services/dashboard.service';
import { Emprestimo } from '../../models/emprestimo.model';
import { ToastService } from '../../shared/services/toast.service';
import { Router } from '@angular/router';

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
  resumo: DashboardResumo = {
    alunosCadastrados: 0,
    livrosNoAcervo: 0,
    emprestimosAtivos: 0,
    emprestimosAVencer: 0,
    emAndamento: 0,
    vencidos: 0,
    emprestimos: [],
  };
  descNovaTarefa: string = '';
  tarefaSelecionada: Tarefa | null = null;
  exibeAcaoRapida: boolean = false;
  constructor(
    private tarefaService: TarefaService,
    private configuracaoService: ConfiguracaoService,
    private dashboardService: DashboardService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.carregarTarefas();
    this.dashboardService.obterResumo().subscribe({
      next: (resumo) => {
        this.resumo = resumo;
        this.cdr.markForCheck();
      },
      error: (error) =>
        this.toastService.erro(error.error?.message ?? 'Não foi possível carregar os indicadores do dashboard.'),
    });
    this.exibeAcaoRapida = this.configuracaoService.configuracaoAtivaByChave(
      ConfiguracaoService.CHAVE_ACAO_RAPIDA,
      1,
    );
  }

  adicionarTarefa(): void {
    if (!this.descNovaTarefa.trim()) return;

    this.tarefaService.adicionarTarefa(this.descNovaTarefa.trim()).subscribe({
      next: (tarefa) => {
        this.listaTarefa = [...this.listaTarefa, tarefa];
        this.descNovaTarefa = '';
        this.cdr.markForCheck();
      },
      error: (error) =>
        this.toastService.erro(error.error?.message ?? 'Não foi possível salvar a tarefa.'),
    });
  }

  navegarParaEmprestimo(): void {
    this.router.navigate(['/reservar-material']);
  }

  toggleTarefa(id: number): void {
    const tarefa = this.listaTarefa.find((item) => item.id === id);
    if (!tarefa) return;

    this.tarefaService.alternarConclusao(tarefa).subscribe({
      next: (atualizada) => {
        this.listaTarefa = this.listaTarefa.map((item) => (item.id === id ? atualizada : item));
        this.cdr.markForCheck();
      },
      error: (error) =>
        this.toastService.erro(error.error?.message ?? 'Não foi possível atualizar a tarefa.'),
    });
  }

  abrirConfirmacaoExclusaoTarefa(id: number): void {
    this.tarefaSelecionada = this.listaTarefa.find((tarefa) => tarefa.id === id) ?? null;

    if (!this.tarefaSelecionada) return;

    new bootstrap.Modal(document.getElementById('excluirTarefaModal')).show();
  }

  confirmarExclusaoTarefa(): void {
    if (this.tarefaSelecionada?.id == null) return;

    const id = this.tarefaSelecionada.id;
    this.tarefaService.removerTarefa(id).subscribe({
      next: () => {
        this.listaTarefa = this.listaTarefa.filter((tarefa) => tarefa.id !== id);
        this.tarefaSelecionada = null;
        bootstrap.Modal.getInstance(document.getElementById('excluirTarefaModal'))?.hide();
        this.cdr.markForCheck();
      },
      error: (error) =>
        this.toastService.erro(error.error?.message ?? 'Não foi possível excluir a tarefa.'),
    });
  }

  getStatusEmprestimo(emprestimo: Emprestimo): 'Em andamento' | 'A vencer' | 'Vencido' {
    const hoje = this.dataLocalISO(new Date());
    const dataVencimento =
      typeof emprestimo.dataDevolucaoPrevista === 'string'
        ? emprestimo.dataDevolucaoPrevista.slice(0, 10)
        : this.dataLocalISO(emprestimo.dataDevolucaoPrevista);
    const vencimento = dataVencimento;

    if (vencimento < hoje) return 'Vencido';
    const limite = new Date();
    limite.setDate(limite.getDate() + 7);
    if (vencimento <= this.dataLocalISO(limite)) return 'A vencer';
    return 'Em andamento';
  }

  getBadgeStatus(emprestimo: Emprestimo): 'success' | 'warning' | 'danger' {
    switch (this.getStatusEmprestimo(emprestimo)) {
      case 'A vencer':
        return 'warning';
      case 'Vencido':
        return 'danger';
      default:
        return 'success';
    }
  }

  formatarData(data: string | Date): string {
    const valor =
      typeof data === 'string'
        ? new Date(`${data.slice(0, 10)}T00:00:00`)
        : data;
    return valor.toLocaleDateString('pt-BR');
  }

  private carregarTarefas(): void {
    this.tarefaService.getMinhasTarefas().subscribe({
      next: (tarefas) => {
        this.listaTarefa = tarefas;
        this.cdr.markForCheck();
      },
      error: (error) =>
        this.toastService.erro(error.error?.message ?? 'Não foi possível carregar suas tarefas.'),
    });
  }

  private dataLocalISO(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }
}
