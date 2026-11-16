import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, computed, OnInit, signal } from '@angular/core';
import { StatusEmprestimo } from '../../enum/status.enum';
import { Emprestimo } from '../../models/emprestimo.model';
import { EmprestimoService } from '../../services/emprestimo.service';
import { CardStatus } from '../../shared/component/card/card-status/card-status';
import { CorpoPadrao } from '../../shared/component/corpo-padrao/corpo-padrao';
import { LbrLinkEntidade } from '../../shared/component/lbr-link-entidade/lbr-link-entidade';
import { AcaoMenu, LbrAcoes } from '../../shared/component/lbr-acoes/lbr-acoes';
import { LbrFiltros } from '../../shared/component/lbr-filtros/lbr-filtros';
import {
  ConfigFiltro,
  filtrarItens,
  opcoesDosItens,
  temFiltroAtivo,
  ValoresFiltro,
} from '../../shared/component/lbr-filtros/filtros';
import {
  LbrTabela,
  LbrTabelaCabecalho,
  LbrTabelaLinha,
  LbrTabelaOrdenar,
} from '../../shared/component/lbr-tabela/lbr-tabela';
import { ToastService } from '../../shared/services/toast.service';
import { dataISO, formatarDataBR } from '../../utils/data.util';

@Component({
  selector: 'app-historio-emprestimo',
  standalone: true,
  imports: [
    CardStatus,
    CommonModule,
    CorpoPadrao,
    LbrLinkEntidade,
    LbrFiltros,
    LbrAcoes,
    LbrTabela,
    LbrTabelaCabecalho,
    LbrTabelaLinha,
    LbrTabelaOrdenar,
  ],
  templateUrl: './historico-emprestimo.html',
  styleUrl: './historico-emprestimo.scss',
})
export class HistorioEmprestimo implements OnInit {
  constructor(
    private readonly emprestimoService: EmprestimoService,
    private readonly toastService: ToastService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.carregarEmprestimos();
  }

  protected readonly temFiltroAtivo = temFiltroAtivo;
  /** Ordena a coluna Status pelo texto exibido. */
  protected readonly porStatus = (e: Emprestimo) => this.rotuloStatus(this.getStatus(e));
  statusEmprestimo = StatusEmprestimo;
  private readonly lista = signal<Emprestimo[]>([]);
  carregando = true;
  erroCarregamento = '';

  readonly filtros = signal<ValoresFiltro>({});

  readonly configFiltro = computed<ConfigFiltro<Emprestimo>>(() => ({
    placeholderBusca: 'Buscar por ID, usuário ou material...',
    busca: (e) => [e.id, e.usuarioNome, e.materialTitulo],
    campos: [
      {
        tipo: 'opcoes',
        chave: 'status',
        rotulo: 'Status',
        valorDoItem: (e) => this.getStatus(e),
        opcoes: [
          { valor: StatusEmprestimo.ATIVO, rotulo: 'Em andamento' },
          { valor: StatusEmprestimo.DEVOLVIDO, rotulo: 'Devolvido' },
          { valor: StatusEmprestimo.ATRASADO, rotulo: 'Atrasado' },
          { valor: StatusEmprestimo.BLOQUEADO, rotulo: 'Bloqueado' },
        ],
      },
      {
        tipo: 'lista',
        chave: 'usuario',
        rotulo: 'Usuário',
        valorDoItem: (e) => e.usuarioId,
        opcoes: opcoesDosItens(this.lista(), (e) => e.usuarioId, (e) => e.usuarioNome),
      },
      {
        tipo: 'lista',
        chave: 'material',
        rotulo: 'Material',
        valorDoItem: (e) => e.materialId,
        opcoes: opcoesDosItens(this.lista(), (e) => e.materialId, (e) => e.materialTitulo),
      },
      {
        tipo: 'periodo',
        chave: 'emprestimo',
        rotulo: 'Data do empréstimo',
        valorDoItem: (e) => e.dataSaida,
      },
      {
        tipo: 'periodo',
        chave: 'devolucao',
        rotulo: 'Devolução prevista',
        valorDoItem: (e) => e.dataDevolucaoPrevista,
      },
    ],
  }));

  readonly listaFiltrada = computed(() =>
    filtrarItens(this.lista(), this.configFiltro(), this.filtros()),
  );

  acoesDoEmprestimo(emprestimo: Emprestimo): AcaoMenu[] {
    return [{ rotulo: 'Ver detalhes', icone: 'bi-eye', rota: ['/emprestimos', emprestimo.id] }];
  }

  quantidadePorStatus(status: StatusEmprestimo): number {
    return this.listaFiltrada().filter((emprestimo) => this.getStatus(emprestimo) === status).length;
  }

  getStatus(emprestimo: Emprestimo): StatusEmprestimo {
    if (emprestimo.status === StatusEmprestimo.DEVOLVIDO) return StatusEmprestimo.DEVOLVIDO;
    if (emprestimo.status === StatusEmprestimo.BLOQUEADO) return StatusEmprestimo.BLOQUEADO;
    if (emprestimo.status === StatusEmprestimo.ATRASADO) return StatusEmprestimo.ATRASADO;
    if (
      emprestimo.dataDevolucaoPrevista &&
      dataISO(emprestimo.dataDevolucaoPrevista) < dataISO(new Date())
    ) {
      return StatusEmprestimo.ATRASADO;
    }
    return StatusEmprestimo.ATIVO;
  }

  getBadge(status: StatusEmprestimo): string {
    switch (status) {
      case StatusEmprestimo.ATIVO:
        return 'bg-primary-subtle text-primary';
      case StatusEmprestimo.DEVOLVIDO:
        return 'bg-success-subtle text-success';
      case StatusEmprestimo.ATRASADO:
        return 'bg-danger-subtle text-danger';
      case StatusEmprestimo.BLOQUEADO:
        return 'bg-warning-subtle text-warning-emphasis';
      default:
        return 'bg-secondary-subtle text-secondary';
    }
  }

  rotuloStatus(status: StatusEmprestimo): string {
    const rotulos: Record<StatusEmprestimo, string> = {
      [StatusEmprestimo.ATIVO]: 'Em andamento',
      [StatusEmprestimo.ANDAMENTO]: 'Em andamento',
      [StatusEmprestimo.DEVOLVIDO]: 'Devolvido',
      [StatusEmprestimo.ATRASADO]: 'Atrasado',
      [StatusEmprestimo.BLOQUEADO]: 'Bloqueado',
    };
    return rotulos[status] ?? status;
  }

  formatarDataEmprestimo(data?: Date | string): string {
    return formatarDataBR(data);
  }

  carregarEmprestimos(): void {
    this.carregando = true;
    this.erroCarregamento = '';
    this.emprestimoService.listarVisiveis().subscribe({
      next: (emprestimos) => {
        this.lista.set([...emprestimos].sort((a, b) => {
          const dataA = dataISO(a.dataSaida);
          const dataB = dataISO(b.dataSaida);
          return dataB.localeCompare(dataA) || (b.id ?? 0) - (a.id ?? 0);
        }));
        this.carregando = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.erroCarregamento = error.error?.message ?? 'Não foi possível carregar os empréstimos.';
        this.carregando = false;
        this.toastService.erro(this.erroCarregamento);
        this.cdr.markForCheck();
      },
    });
  }
}
