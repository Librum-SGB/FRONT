import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Emprestimo } from '../../models/emprestimo.model';
import { StatusEmprestimo } from '../../enum/status.enum';
import { CorpoPadrao } from '../../shared/component/corpo-padrao/corpo-padrao';
import { LbrFiltros } from '../../shared/component/lbr-filtros/lbr-filtros';
import { ConfigFiltro, filtrarItens, ValoresFiltro } from '../../shared/component/lbr-filtros/filtros';
import {
  LbrTabela,
  LbrTabelaCabecalho,
  LbrTabelaLinha,
  LbrTabelaOrdenar,
} from '../../shared/component/lbr-tabela/lbr-tabela';

@Component({
  selector: 'app-bloqueios',
  imports: [
    CommonModule,
    CorpoPadrao,
    LbrFiltros,
    LbrTabela,
    LbrTabelaCabecalho,
    LbrTabelaLinha,
    LbrTabelaOrdenar,
  ],
  templateUrl: './bloqueios.html',
  styleUrl: './bloqueios.scss',
})
export class Bloqueios {

  emprestimos: Emprestimo[] = [
    {
      id: 1,
      usuarioId: 1,
      exemplarId: 1,
      gestorId: 1,

      dataSaida: new Date('2025-10-10'),
      dataDevolucaoPrevista: new Date('2025-10-31'),

      diasAtraso: 12,
      penalidadeDias: 12,

      status: StatusEmprestimo.BLOQUEADO,

      observacao: 'Carlos Alberto Souza',
    },

    {
      id: 2,
      usuarioId: 2,
      exemplarId: 1,
      gestorId: 1,

      dataSaida: new Date('2025-10-20'),
      dataDevolucaoPrevista: new Date('2025-11-04'),

      diasAtraso: 8,
      penalidadeDias: 8,

      status: StatusEmprestimo.BLOQUEADO,

      observacao: 'Felipe Costa',
    },

    {
      id: 3,
      usuarioId: 3,
      exemplarId: 1,
      gestorId: 1,

      dataSaida: new Date('2025-10-25'),
      dataDevolucaoPrevista: new Date('2025-11-07'),

      diasAtraso: 5,
      penalidadeDias: 5,

      status: StatusEmprestimo.ATRASADO,

      observacao: 'Ricardo Mendes',
    },

    {
      id: 4,
      usuarioId: 4,
      exemplarId: 1,
      gestorId: 1,

      dataSaida: new Date('2025-10-01'),
      dataDevolucaoPrevista: new Date('2025-10-27'),

      diasAtraso: 16,
      penalidadeDias: 16,

      status: StatusEmprestimo.BLOQUEADO,

      observacao: 'Juliana Santos',
    },

    {
      id: 5,
      usuarioId: 5,
      exemplarId: 1,
      gestorId: 1,

      dataSaida: new Date('2025-09-28'),
      dataDevolucaoPrevista: new Date('2025-10-19'),

      diasAtraso: 24,
      penalidadeDias: 24,

      status: StatusEmprestimo.BLOQUEADO,

      observacao: 'Bruno Oliveira',
    },

    {
      id: 6,
      usuarioId: 6,
      exemplarId: 1,
      gestorId: 1,

      dataSaida: new Date('2025-09-20'),
      dataDevolucaoPrevista: new Date('2025-10-14'),

      diasAtraso: 29,
      penalidadeDias: 29,

      status: StatusEmprestimo.BLOQUEADO,

      observacao: 'Mariana Lima',
    },
  ];

  readonly filtros = signal<ValoresFiltro>({});

  readonly configFiltro: ConfigFiltro<Emprestimo> = {
    placeholderBusca: 'Buscar por nome ou ID...',
    busca: (e) => [e.id, e.observacao],
    campos: [
      {
        tipo: 'opcoes',
        chave: 'status',
        rotulo: 'Status',
        valorDoItem: (e) => e.status,
        opcoes: [
          { valor: StatusEmprestimo.BLOQUEADO, rotulo: 'Bloqueado' },
          { valor: StatusEmprestimo.ATRASADO, rotulo: 'Pendente' },
        ],
      },
    ],
  };

  readonly emprestimosFiltrados = computed(() =>
    filtrarItens(this.emprestimos, this.configFiltro, this.filtros()),
  );

  get totalBloqueados() {
    return this.emprestimos.filter((e) => e.status === StatusEmprestimo.BLOQUEADO).length;
  }

  get totalPendentes() {
    return this.emprestimos.filter((e) => e.status === StatusEmprestimo.ATRASADO).length;
  }

  get totalUsuarios() {
    return this.emprestimos.length;
  }

  formatarData(data: Date | string | undefined): string {
    if (!data) return '';

    const dataLocal =
      typeof data === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data)
        ? new Date(`${data}T00:00:00`)
        : new Date(data);
    return dataLocal.toLocaleDateString('pt-BR');
  }
}
