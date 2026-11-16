import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StatusEmprestimo } from '../../enum/status.enum';
import { Emprestimo } from '../../models/emprestimo.model';
import { EmprestimoService } from '../../services/emprestimo.service';
import { CardStatus } from '../../shared/component/card/card-status/card-status';
import { CorpoPadrao } from '../../shared/component/corpo-padrao/corpo-padrao';
import { InputBusca } from '../../shared/component/input-busca/input-busca';
import {
  LbrTabela,
  LbrTabelaCabecalho,
  LbrTabelaLinha,
} from '../../shared/component/lbr-tabela/lbr-tabela';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-historio-emprestimo',
  standalone: true,
  imports: [
    FormsModule,
    CardStatus,
    CommonModule,
    CorpoPadrao,
    InputBusca,
    LbrTabela,
    LbrTabelaCabecalho,
    LbrTabelaLinha,
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

  dataInicial = '';
  dataFinal = '';
  busca = '';
  statusSelecionado = 'TODOS';
  statusEmprestimo = StatusEmprestimo;
  lista: Emprestimo[] = [];
  carregando = true;
  erroCarregamento = '';

  get listaFiltrada(): Emprestimo[] {
    const termo = this.busca.trim().toLocaleLowerCase('pt-BR');
    return this.lista.filter((emprestimo) => {
      const data = this.dataISO(emprestimo.dataSaida);
      if (this.dataInicial && (!data || data < this.dataInicial)) return false;
      if (this.dataFinal && (!data || data > this.dataFinal)) return false;
      if (
        this.statusSelecionado !== 'TODOS' &&
        this.getStatus(emprestimo) !== this.statusSelecionado
      ) {
        return false;
      }

      return (
        !termo ||
        [emprestimo.id, emprestimo.usuarioNome, emprestimo.materialTitulo]
          .some((valor) => String(valor ?? '').toLocaleLowerCase('pt-BR').includes(termo))
      );
    });
  }

  aplicarBusca(busca: { texto: string; filtro: string }): void {
    this.busca = busca.texto;
  }

  quantidadePorStatus(status: StatusEmprestimo): number {
    return this.listaFiltrada.filter((emprestimo) => this.getStatus(emprestimo) === status).length;
  }

  getStatus(emprestimo: Emprestimo): StatusEmprestimo {
    if (emprestimo.status === StatusEmprestimo.DEVOLVIDO) return StatusEmprestimo.DEVOLVIDO;
    if (emprestimo.status === StatusEmprestimo.BLOQUEADO) return StatusEmprestimo.BLOQUEADO;
    if (emprestimo.status === StatusEmprestimo.ATRASADO) return StatusEmprestimo.ATRASADO;
    if (
      emprestimo.dataDevolucaoPrevista &&
      this.dataISO(emprestimo.dataDevolucaoPrevista) < this.dataISO(new Date())
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
    const dataISO = this.dataISO(data);
    return dataISO ? new Date(`${dataISO}T00:00:00`).toLocaleDateString('pt-BR') : '—';
  }

  carregarEmprestimos(): void {
    this.carregando = true;
    this.erroCarregamento = '';
    this.emprestimoService.listarVisiveis().subscribe({
      next: (emprestimos) => {
        this.lista = [...emprestimos].sort((a, b) => {
          const dataA = this.dataISO(a.dataSaida);
          const dataB = this.dataISO(b.dataSaida);
          return dataB.localeCompare(dataA) || (b.id ?? 0) - (a.id ?? 0);
        });
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

  private dataISO(data?: Date | string): string {
    if (!data) return '';
    if (typeof data === 'string') return data.slice(0, 10);
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }
}
