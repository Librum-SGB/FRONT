import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Emprestimo } from '../../models/emprestimo.model';
import { EmprestimoService } from '../../services/emprestimo.service';
import { Badge } from '../../shared/component/badge/badge';
import { CorpoPadrao } from '../../shared/component/corpo-padrao/corpo-padrao';
import { InputBusca } from '../../shared/component/input-busca/input-busca';
import { ToastService } from '../../shared/services/toast.service';

const ITENS_POR_PAGINA = 10;

@Component({
  selector: 'app-renovar-devolver-material',
  standalone: true,
  imports: [CommonModule, Badge, CorpoPadrao, InputBusca],
  templateUrl: './renovar-devolver-material.html',
})
export class RenovarDevolverMaterial implements OnInit {
  emprestimos: Emprestimo[] = [];
  emprestimoSelecionado: Emprestimo | null = null;
  busca = '';
  paginaAtual = 1;
  carregando = true;
  salvando = false;
  erroCarregamento = '';

  constructor(
    private readonly emprestimoService: EmprestimoService,
    private readonly toastService: ToastService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.carregarEmprestimos();
  }

  get emprestimosFiltrados(): Emprestimo[] {
    const termo = this.busca.trim().toLocaleLowerCase('pt-BR');
    if (!termo) return this.emprestimos;

    return this.emprestimos.filter((emprestimo) =>
      [
        emprestimo.id,
        emprestimo.usuarioNome,
        emprestimo.materialTitulo,
      ]
        .some((valor) => String(valor ?? '').toLocaleLowerCase('pt-BR').includes(termo)),
    );
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.emprestimosFiltrados.length / ITENS_POR_PAGINA));
  }

  get paginaEfetiva(): number {
    return Math.min(this.paginaAtual, this.totalPaginas);
  }

  get emprestimosPagina(): Emprestimo[] {
    const inicio = (this.paginaEfetiva - 1) * ITENS_POR_PAGINA;
    return this.emprestimosFiltrados.slice(inicio, inicio + ITENS_POR_PAGINA);
  }

  get inicioExibicao(): number {
    return this.emprestimosFiltrados.length === 0 ? 0 : (this.paginaEfetiva - 1) * ITENS_POR_PAGINA + 1;
  }

  get fimExibicao(): number {
    return Math.min(this.paginaEfetiva * ITENS_POR_PAGINA, this.emprestimosFiltrados.length);
  }

  get paginasVisiveis(): number[] {
    const total = this.totalPaginas;
    const atual = this.paginaEfetiva;
    const janela = 5;
    let inicio = Math.max(1, atual - Math.floor(janela / 2));
    const fim = Math.min(total, inicio + janela - 1);
    inicio = Math.max(1, fim - janela + 1);
    return Array.from({ length: fim - inicio + 1 }, (_, index) => inicio + index);
  }

  aplicarBusca(busca: { texto: string; filtro: string }): void {
    this.busca = busca.texto;
    this.paginaAtual = 1;
  }

  irParaPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaAtual = pagina;
  }

  selecionar(emprestimo: Emprestimo): void {
    this.emprestimoSelecionado =
      this.emprestimoSelecionado?.id === emprestimo.id ? null : emprestimo;
  }

  statusLabel(emprestimo: Emprestimo): string {
    return this.estaAtrasado(emprestimo) ? 'Atrasado' : 'Em andamento';
  }

  statusBadge(emprestimo: Emprestimo): 'danger' | 'success' {
    return this.estaAtrasado(emprestimo) ? 'danger' : 'success';
  }

  podeRenovar(emprestimo: Emprestimo): boolean {
    return emprestimo.status === 'ATIVO' && !this.estaAtrasado(emprestimo);
  }

  formatarData(data?: Date | string): string {
    if (!data) return '—';
    const dataISO = typeof data === 'string' ? data.slice(0, 10) : this.dataISO(data);
    if (!dataISO) return '—';
    return new Date(`${dataISO}T00:00:00`).toLocaleDateString('pt-BR');
  }

  renovar(): void {
    const emprestimo = this.emprestimoSelecionado;
    if (!emprestimo?.id || !this.podeRenovar(emprestimo) || this.salvando) return;

    this.salvando = true;
    this.emprestimoService.renovar(emprestimo.id).subscribe({
      next: (atualizado) => {
        this.atualizarEmprestimo(atualizado);
        this.toastService.sucesso('Empréstimo renovado com sucesso.');
        this.salvando = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.toastService.erro(error.error?.message ?? 'Não foi possível renovar o empréstimo.');
        this.salvando = false;
        this.cdr.markForCheck();
      },
    });
  }

  devolver(): void {
    const emprestimo = this.emprestimoSelecionado;
    if (!emprestimo?.id || this.salvando) return;

    this.salvando = true;
    this.emprestimoService.devolver(emprestimo.id).subscribe({
      next: (atualizado) => {
        this.emprestimos = this.emprestimos.filter((item) => item.id !== atualizado.id);
        this.emprestimoSelecionado = null;
        if (this.paginaAtual > this.totalPaginas) this.paginaAtual = this.totalPaginas;
        this.toastService.sucesso('Material devolvido com sucesso.');
        this.salvando = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.toastService.erro(error.error?.message ?? 'Não foi possível registrar a devolução.');
        this.salvando = false;
        this.cdr.markForCheck();
      },
    });
  }

  carregarEmprestimos(): void {
    this.carregando = true;
    this.erroCarregamento = '';
    this.emprestimoService.listarVisiveis(true).subscribe({
      next: (emprestimos) => {
        this.emprestimos = emprestimos.filter((emprestimo) => emprestimo.status !== 'DEVOLVIDO');
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

  private atualizarEmprestimo(atualizado: Emprestimo): void {
    this.emprestimos = this.emprestimos.map((item) => item.id === atualizado.id ? atualizado : item);
    this.emprestimoSelecionado = atualizado;
  }

  private estaAtrasado(emprestimo: Emprestimo): boolean {
    if (emprestimo.status === 'ATRASADO') return true;
    if (emprestimo.status !== 'ATIVO' || !emprestimo.dataDevolucaoPrevista) return false;
    return String(emprestimo.dataDevolucaoPrevista).slice(0, 10) < this.dataISO(new Date());
  }

  private dataISO(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }
}
