import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardStatus } from '../../shared/component/card/card-status/card-status';
import { CommonModule } from '@angular/common';
import { StatusEmprestimo } from '../../enum/status.enum';

@Component({
  selector: 'app-historio-emprestimo',
  imports: [FormsModule, CardStatus, CommonModule],
  templateUrl: './historio-emprestimo.html',
  styleUrl: './historio-emprestimo.scss',
})
export class HistorioEmprestimo implements OnInit {
  ngOnInit(): void {
    this.filtarLista();
  }

  public dataInicial: string = this.formatarData(this.dataMenosDias(10));
  public dataFinal: string = this.formatarData(new Date());
  public statusEmprestimo = StatusEmprestimo;
  lista = [
    {
      data: '09/11/2025',
      usuario: 'João Pedro Silva',
      livro: 'Programação em Python',
      status: StatusEmprestimo.ANDAMENTO,
    },
    {
      data: '07/11/2025',
      usuario: 'Maria Eduarda Santos',
      livro: 'Gestão de Projetos',
      status: StatusEmprestimo.DEVOLVIDO,
    },
    {
      data: '24/04/2026',
      usuario: 'Carlos Alberto Souza',
      livro: 'Eletrônica Digital',
      status: StatusEmprestimo.ATRASADO,
    },
  ];
  public listaFiltrada = this.lista;

  converterData(data: string): Date {
    const [dia, mes, ano] = data.split('/');
    return new Date(`${ano}-${mes}-${dia}`);
  }

  filtarLista() {
    this.listaFiltrada = this.lista.filter((emp) => {
      const data = this.converterData(emp.data);
      const inicio = new Date(this.dataInicial);
      const fim = new Date(this.dataFinal);

      return data >= inicio && data <= fim;
    });
  }

  getBadge(status: string): string {
    switch (status) {
      case StatusEmprestimo.ANDAMENTO:
        return 'bg-primary-subtle text-primary';
      case StatusEmprestimo.DEVOLVIDO:
        return 'bg-success-subtle text-success';
      case StatusEmprestimo.ATRASADO:
        return 'bg-danger-subtle text-danger';
      default:
        return 'bg-secondary-subtle text-secondary';
    }
  }

  dataMenosDias(dias: number): Date {
    const data = new Date();
    data.setDate(data.getDate() - dias);
    return data;
  }

  formatarData(data: Date): string {
    return data.toISOString().split('T')[0];
  }
}
