import { ChangeDetectorRef, Component, computed, OnInit, signal } from '@angular/core';
import { Emprestimo } from '../../models/emprestimo.model';
import { EmprestimoService } from '../../services/emprestimo.service';
import { OperacoesEmprestimoService } from '../../services/operacoes-emprestimo.service';
import { Badge } from '../../shared/component/badge/badge';
import { CorpoPadrao } from '../../shared/component/corpo-padrao/corpo-padrao';
import { AcaoMenu, LbrAcoes } from '../../shared/component/lbr-acoes/lbr-acoes';
import { LbrFiltros } from '../../shared/component/lbr-filtros/lbr-filtros';
import {
  ConfigFiltro,
  filtrarItens,
  opcoesDosItens,
  temFiltroAtivo,
  ValoresFiltro,
} from '../../shared/component/lbr-filtros/filtros';
import { LbrLinkEntidade } from '../../shared/component/lbr-link-entidade/lbr-link-entidade';
import {
  LbrTabela,
  LbrTabelaCabecalho,
  LbrTabelaLinha,
  LbrTabelaOrdenar,
} from '../../shared/component/lbr-tabela/lbr-tabela';
import {
  corSituacao,
  diasDeAtraso,
  rotuloSituacao,
} from '../../utils/emprestimo.util';
import { formatarDataBR } from '../../utils/data.util';

@Component({
  selector: 'app-renovar-devolver-material',
  standalone: true,
  imports: [
    Badge,
    CorpoPadrao,
    LbrAcoes,
    LbrLinkEntidade,
    LbrFiltros,
    LbrTabela,
    LbrTabelaCabecalho,
    LbrTabelaLinha,
    LbrTabelaOrdenar,
  ],
  templateUrl: './renovar-devolver-material.html',
})
export class RenovarDevolverMaterial implements OnInit {
  protected readonly temFiltroAtivo = temFiltroAtivo;
  protected readonly formatarData = formatarDataBR;
  protected readonly rotuloSituacao = rotuloSituacao;
  protected readonly corSituacao = corSituacao;

  private readonly emprestimos = signal<Emprestimo[]>([]);
  /** Empréstimo com renovação/devolução em andamento (evita cliques repetidos). */
  private readonly processandoId = signal<number | null>(null);
  carregando = true;
  erroCarregamento = '';

  readonly filtros = signal<ValoresFiltro>({});

  readonly configFiltro = computed<ConfigFiltro<Emprestimo>>(() => ({
    placeholderBusca: 'Buscar por ID, usuário ou material...',
    busca: (e) => [e.id, e.usuarioNome, e.materialTitulo],
    campos: [
      {
        tipo: 'opcoes',
        chave: 'situacao',
        rotulo: 'Situação',
        valorDoItem: (e) => (diasDeAtraso(e) > 0 || e.status === 'ATRASADO' ? 'ATRASADO' : 'EM_ANDAMENTO'),
        opcoes: [
          { valor: 'EM_ANDAMENTO', rotulo: 'Em andamento' },
          { valor: 'ATRASADO', rotulo: 'Atrasado' },
        ],
      },
      {
        tipo: 'lista',
        chave: 'usuario',
        rotulo: 'Usuário',
        valorDoItem: (e) => e.usuarioId,
        opcoes: opcoesDosItens(this.emprestimos(), (e) => e.usuarioId, (e) => e.usuarioNome),
      },
      {
        tipo: 'periodo',
        chave: 'vencimento',
        rotulo: 'Devolução prevista',
        valorDoItem: (e) => e.dataDevolucaoPrevista,
      },
    ],
  }));

  readonly emprestimosFiltrados = computed(() =>
    filtrarItens(this.emprestimos(), this.configFiltro(), this.filtros()),
  );

  constructor(
    private readonly emprestimoService: EmprestimoService,
    private readonly operacoes: OperacoesEmprestimoService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.carregarEmprestimos();
  }

  acoesDoEmprestimo(emprestimo: Emprestimo): AcaoMenu[] {
    const ocupado = this.processandoId() !== null;
    const atrasado = diasDeAtraso(emprestimo) > 0 || emprestimo.status === 'ATRASADO';
    return [
      { rotulo: 'Ver detalhes', icone: 'bi-eye', rota: ['/emprestimos', emprestimo.id] },
      {
        rotulo: 'Renovar',
        icone: 'bi-arrow-repeat',
        separadorAntes: true,
        desabilitado: ocupado || atrasado,
        dica: atrasado ? 'Empréstimos atrasados não podem ser renovados.' : undefined,
        executar: () => void this.renovar(emprestimo),
      },
      {
        rotulo: 'Registrar devolução',
        icone: 'bi-box-arrow-in-down',
        desabilitado: ocupado,
        executar: () => void this.devolver(emprestimo),
      },
    ];
  }

  async renovar(emprestimo: Emprestimo): Promise<void> {
    this.processandoId.set(emprestimo.id ?? null);
    const atualizado = await this.operacoes.renovar(emprestimo);
    this.processandoId.set(null);
    if (atualizado) {
      this.emprestimos.update((lista) =>
        lista.map((item) => (item.id === atualizado.id ? atualizado : item)),
      );
    }
  }

  async devolver(emprestimo: Emprestimo): Promise<void> {
    this.processandoId.set(emprestimo.id ?? null);
    const atualizado = await this.operacoes.devolver(emprestimo);
    this.processandoId.set(null);
    if (atualizado) {
      this.emprestimos.update((lista) => lista.filter((item) => item.id !== atualizado.id));
    }
  }

  carregarEmprestimos(): void {
    this.carregando = true;
    this.erroCarregamento = '';
    this.emprestimoService.listarVisiveis(true).subscribe({
      next: (emprestimos) => {
        this.emprestimos.set(emprestimos.filter((emprestimo) => emprestimo.status !== 'DEVOLVIDO'));
        this.carregando = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.erroCarregamento = error.error?.message ?? 'Não foi possível carregar os empréstimos em aberto.';
        this.carregando = false;
        this.cdr.markForCheck();
      },
    });
  }
}
