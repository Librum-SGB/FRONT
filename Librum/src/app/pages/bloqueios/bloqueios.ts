import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Emprestimo } from '../../models/emprestimo.model';
import { StatusEmprestimo } from '../../enum/status.enum';

@Component({
  selector: 'app-bloqueios',
  imports: [CommonModule, FormsModule],
  templateUrl: './bloqueios.html',
  styleUrl: './bloqueios.scss',
})
export class Bloqueios {

  filtroSelecionado: string = 'todos';
  pesquisa: string = '';

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

      observacao: 'Carlos Alberto Souza'
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

      observacao: 'Felipe Costa'
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

      observacao: 'Ricardo Mendes'
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

      observacao: 'Juliana Santos'
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

      observacao: 'Bruno Oliveira'
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

      observacao: 'Mariana Lima'
    }
  ];

  get emprestimosFiltrados() {

    if (!this.pesquisa.trim()) {
      return this.emprestimos;
    }

    const termo = this.pesquisa.toLowerCase();

    return this.emprestimos.filter(emprestimo => {

      const nome = emprestimo.observacao?.toLowerCase() || '';
      const status = emprestimo.status?.toLowerCase() || '';

      if (this.filtroSelecionado === 'todos') {

        return (
          emprestimo.id?.toString().includes(termo) ||
          nome.includes(termo) ||
          status.includes(termo)
        );
      }

      if (this.filtroSelecionado === 'id') {
        return emprestimo.id?.toString().includes(termo);
      }

      if (this.filtroSelecionado === 'nome') {
        return nome.includes(termo);
      }

      if (this.filtroSelecionado === 'status') {
        return status.includes(termo);
      }

      return true;
    });
  }

  get totalBloqueados() {
    return this.emprestimos.filter(
      e => e.status === StatusEmprestimo.BLOQUEADO
    ).length;
  }

  get totalPendentes() {
    return this.emprestimos.filter(
      e => e.status === StatusEmprestimo.ATRASADO
    ).length;
  }

  get totalUsuarios() {
    return this.emprestimos.length;
  }

  formatarData(data: Date | undefined): string {

    if (!data) return '';

    return new Date(data).toLocaleDateString('pt-BR');
  }
}