import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AutorResponse } from '../../models/autor.model';
import { ExemplarResponse } from '../../models/exemplar.model';
import { MaterialResponse } from '../../models/material.model';
import { Usuario } from '../../models/usuario.model';
import { AutorService } from '../../services/autor';
import { EmprestimoService } from '../../services/emprestimo.service';
import { ExemplarService } from '../../services/exemplar';
import { MaterialService } from '../../services/material';
import { UsuarioService } from '../../services/usuario.service';
import { ToastService } from '../../shared/services/toast.service';
import { CorpoPadrao } from '../../shared/component/corpo-padrao/corpo-padrao';

interface MaterialParaEmprestimo {
  material: MaterialResponse;
  autor: string;
  exemplaresDisponiveis: ExemplarResponse[];
}

interface ItemEmprestimo {
  material: MaterialParaEmprestimo;
  exemplarId: number;
}

@Component({
  selector: 'app-reservar-material',
  standalone: true,
  imports: [CommonModule, FormsModule, CorpoPadrao],
  templateUrl: './reservar-material.html',
  styleUrl: './reservar-material.scss',
})
export class ReservarMaterial implements OnInit {
  usuarios: Usuario[] = [];
  materiais: MaterialParaEmprestimo[] = [];
  materiaisSelecionados: ItemEmprestimo[] = [];
  materialDetalhe: MaterialParaEmprestimo | null = null;
  usuarioDetalhe: Usuario | null = null;
  usuarioSelecionado: Usuario | null = null;
  etapaAtual = 1;
  buscaMaterial = '';
  buscaUsuario = '';
  dataDevolucaoPrevista = this.dataISO(this.adicionarDias(new Date(), 14));
  hoje = this.dataISO(new Date());
  emprestimosAbertos = 0;
  carregando = true;
  salvando = false;
  erroCarregamento = '';
  private consultaEmprestimosId = 0;

  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly materialService: MaterialService,
    private readonly exemplarService: ExemplarService,
    private readonly autorService: AutorService,
    private readonly emprestimoService: EmprestimoService,
    private readonly toastService: ToastService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  get materiaisFiltrados(): MaterialParaEmprestimo[] {
    const termo = this.buscaMaterial.trim().toLocaleLowerCase('pt-BR');
    if (!termo) return this.materiais;
    return this.materiais.filter(({ material, autor }) =>
      `${material.titulo} ${autor} ${material.tipo}`.toLocaleLowerCase('pt-BR').includes(termo),
    );
  }

  get usuariosFiltrados(): Usuario[] {
    const termo = this.buscaUsuario.trim().toLocaleLowerCase('pt-BR');
    return this.usuarios.filter(
      (usuario) =>
        usuario.nome.toLocaleLowerCase('pt-BR').includes(termo) ||
        String(usuario.id ?? '').includes(termo),
    );
  }

  quantidadeDisponivel(material: MaterialParaEmprestimo): number {
    return material.exemplaresDisponiveis.filter(
      (exemplar) => !this.materiaisSelecionados.some((item) => item.exemplarId === exemplar.id),
    ).length;
  }

  get limiteExcedido(): boolean {
    const limite = this.usuarioSelecionado?.limiteLivros ?? 3;
    return this.emprestimosAbertos + this.materiaisSelecionados.length > limite;
  }

  selecionarMaterial(material: MaterialParaEmprestimo): void {
    const exemplar = material.exemplaresDisponiveis.find(
      (item) => !this.materiaisSelecionados.some((selecionado) => selecionado.exemplarId === item.id),
    );
    if (!exemplar) {
      this.toastService.aviso('Não há exemplares disponíveis deste material.');
      return;
    }
    this.materiaisSelecionados = [...this.materiaisSelecionados, { material, exemplarId: exemplar.id }];
  }

  removerMaterial(item: ItemEmprestimo): void {
    this.materiaisSelecionados = this.materiaisSelecionados.filter(
      (material) => material.exemplarId !== item.exemplarId,
    );
  }

  continuar(): void {
    if (this.materiaisSelecionados.length === 0) return;
    this.etapaAtual = 2;
    this.buscaUsuario = '';
    this.consultaEmprestimosId++;
    this.usuarioSelecionado = null;
    this.emprestimosAbertos = 0;
  }

  voltar(): void {
    this.etapaAtual = 1;
    this.consultaEmprestimosId++;
    this.usuarioSelecionado = null;
    this.emprestimosAbertos = 0;
  }

  selecionarUsuario(usuario: Usuario): void {
    if (usuario.estaBloqueado) {
      this.toastService.erro('Este usuário está bloqueado e não pode realizar empréstimos.');
      return;
    }
    this.usuarioSelecionado = usuario;
    this.emprestimosAbertos = 0;
    const consultaId = ++this.consultaEmprestimosId;
    if (usuario.id == null) return;
    this.emprestimoService.listarPorUsuario(usuario.id).subscribe({
      next: (emprestimos) => {
        if (consultaId !== this.consultaEmprestimosId) return;
        this.emprestimosAbertos = emprestimos.filter(
          (emprestimo) => emprestimo.status === 'ATIVO' || emprestimo.status === 'ATRASADO',
        ).length;
        this.cdr.markForCheck();
      },
      error: (error) => {
        if (consultaId === this.consultaEmprestimosId) {
          this.toastService.erro(error.error?.message ?? 'Não foi possível consultar os empréstimos do usuário.');
        }
      },
    });
  }

  removerUsuario(): void {
    this.consultaEmprestimosId++;
    this.usuarioSelecionado = null;
    this.emprestimosAbertos = 0;
  }

  concluirReserva(): void {
    if (
      !this.usuarioSelecionado?.id ||
      this.materiaisSelecionados.length === 0 ||
      !this.dataDevolucaoPrevista
    ) {
      this.toastService.aviso('Selecione o usuário, os materiais e a data de devolução.');
      return;
    }
    if (this.limiteExcedido) {
      this.toastService.erro('O usuário atingiu o limite de materiais emprestados.');
      return;
    }
    if (this.dataDevolucaoPrevista < this.hoje) {
      this.toastService.aviso('A data de devolução não pode estar no passado.');
      return;
    }

    this.salvando = true;
    this.emprestimoService
      .criarLote({
        usuarioId: this.usuarioSelecionado.id,
        exemplarIds: this.materiaisSelecionados.map((item) => item.exemplarId),
        dataDevolucaoPrevista: this.dataDevolucaoPrevista,
      })
      .subscribe({
        next: (emprestimos) => {
          this.toastService.sucesso(
            `${emprestimos.length} ${emprestimos.length === 1 ? 'empréstimo registrado' : 'empréstimos registrados'} com sucesso.`,
          );
          this.materiaisSelecionados = [];
          this.removerUsuario();
          this.etapaAtual = 1;
          this.salvando = false;
          this.carregarDados();
        },
        error: (error) => {
          this.salvando = false;
          this.toastService.erro(error.error?.message ?? 'Não foi possível registrar o empréstimo.');
          this.cdr.markForCheck();
        },
      });
  }

  carregarDados(): void {
    this.carregando = true;
    this.erroCarregamento = '';
    forkJoin({
      usuarios: this.usuarioService.listarAlunos(),
      materiais: this.materialService.findAll(true),
      exemplares: this.exemplarService.findAll(true),
      autores: this.autorService.findAll(),
    }).subscribe({
      next: ({ usuarios, materiais, exemplares, autores }) => {
        this.usuarios = usuarios;
        const autoresPorId = new Map(autores.map((autor: AutorResponse) => [autor.id, autor.nome]));
        this.materiais = materiais
          .map((material: MaterialResponse) => {
            const autorIds = [
              ...new Set([...(material.autorIds ?? []), ...(material.autorId ? [material.autorId] : [])]),
            ];
            return {
              material,
              autor: autorIds.map((id) => autoresPorId.get(id)).filter(Boolean).join(', ') || 'Não informado',
              exemplaresDisponiveis: exemplares.filter(
                (exemplar: ExemplarResponse) =>
                  exemplar.materialId === material.id && exemplar.status === 'DISPONIVEL',
              ),
            };
          })
          .sort((a, b) => a.material.titulo.localeCompare(b.material.titulo, 'pt-BR'));
        this.carregando = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.carregando = false;
        this.erroCarregamento =
          error.error?.message ?? 'Não foi possível carregar os usuários e materiais.';
        this.cdr.markForCheck();
      },
    });
  }

  private adicionarDias(data: Date, dias: number): Date {
    const resultado = new Date(data.getFullYear(), data.getMonth(), data.getDate());
    resultado.setDate(resultado.getDate() + dias);
    return resultado;
  }

  private dataISO(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }
}
