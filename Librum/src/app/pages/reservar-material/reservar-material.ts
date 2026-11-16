import { Component, computed, inject, OnInit, signal } from '@angular/core';
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
import { LbrButtom } from '../../shared/component/lbr-buttom/lbr-buttom';
import { LbrLinkEntidade } from '../../shared/component/lbr-link-entidade/lbr-link-entidade';
import { LbrFiltros } from '../../shared/component/lbr-filtros/lbr-filtros';
import {
  ConfigFiltro,
  filtrarItens,
  temFiltroAtivo,
  ValoresFiltro,
} from '../../shared/component/lbr-filtros/filtros';
import {
  LbrTabela,
  LbrTabelaCabecalho,
  LbrTabelaLinha,
  LbrTabelaOrdenar,
} from '../../shared/component/lbr-tabela/lbr-tabela';
import { dataDaquiA, formatarDataBR } from '../../utils/data.util';
import {
  EmprestimoEmAndamentoService,
  EtapaEmprestimo,
  ItemEmprestimo,
  MaterialParaEmprestimo,
} from './emprestimo-em-andamento.service';

const ROTULOS_TIPO: Record<string, string> = {
  LIVRO: 'Livro',
  PERIODICO: 'Periódico',
  OUTRO: 'Outros',
};

@Component({
  selector: 'app-reservar-material',
  standalone: true,
  imports: [
    CorpoPadrao,
    LbrButtom,
    LbrLinkEntidade,
    LbrFiltros,
    LbrTabela,
    LbrTabelaCabecalho,
    LbrTabelaLinha,
    LbrTabelaOrdenar,
  ],
  templateUrl: './reservar-material.html',
  styleUrl: './reservar-material.scss',
})
export class ReservarMaterial implements OnInit {
  private readonly usuarioService = inject(UsuarioService);
  private readonly materialService = inject(MaterialService);
  private readonly exemplarService = inject(ExemplarService);
  private readonly autorService = inject(AutorService);
  private readonly emprestimoService = inject(EmprestimoService);
  private readonly toastService = inject(ToastService);
  /** Estado do empréstimo em montagem (sobrevive a idas e vindas entre telas). */
  protected readonly estado = inject(EmprestimoEmAndamentoService);

  protected readonly temFiltroAtivo = temFiltroAtivo;
  protected readonly formatarData = formatarDataBR;
  protected readonly hoje = dataDaquiA(0);
  protected readonly prazosRapidos = [7, 14, 21, 30];

  // Valores usados para ordenar as colunas calculadas das tabelas.
  protected readonly porSituacaoLeitor = (u: Usuario) => (u.estaBloqueado ? 'Bloqueado' : 'Disponível');
  protected readonly porTipo = (item: MaterialParaEmprestimo) => this.rotuloTipo(item.material.tipo);
  protected readonly porDisponiveis = (item: MaterialParaEmprestimo) => this.quantidadeDisponivel(item);

  readonly usuarios = signal<Usuario[]>([]);
  readonly materiais = signal<MaterialParaEmprestimo[]>([]);
  readonly carregando = signal(true);
  readonly salvando = signal(false);
  readonly erroCarregamento = signal('');

  readonly filtrosUsuarios = signal<ValoresFiltro>({});
  readonly filtrosMateriais = signal<ValoresFiltro>({});
  private consultaEmprestimosId = 0;

  readonly etapas = computed(() => {
    const usuario = this.estado.usuario();
    const quantidade = this.estado.itens().length;
    return [
      { numero: 1 as EtapaEmprestimo, rotulo: 'Leitor', resumo: usuario?.nome ?? 'Quem vai levar' },
      {
        numero: 2 as EtapaEmprestimo,
        rotulo: 'Materiais',
        resumo: quantidade
          ? `${quantidade} ${quantidade === 1 ? 'selecionado' : 'selecionados'}`
          : 'O que vai levar',
      },
      { numero: 3 as EtapaEmprestimo, rotulo: 'Confirmação', resumo: 'Prazo e revisão' },
    ];
  });

  readonly configUsuarios: ConfigFiltro<Usuario> = {
    placeholderBusca: 'Buscar leitor por nome, ID, e-mail ou CPF...',
    busca: (u) => [u.id, u.nome, u.email, u.cpf],
  };

  readonly configMateriais: ConfigFiltro<MaterialParaEmprestimo> = {
    placeholderBusca: 'Buscar por título, autor ou ISBN...',
    busca: ({ material, autor }) => [material.titulo, material.subtitulo, autor, material.isbn],
    campos: [
      {
        tipo: 'opcoes',
        chave: 'tipo',
        rotulo: 'Tipo',
        valorDoItem: ({ material }) => material.tipo,
        opcoes: Object.entries(ROTULOS_TIPO).map(([valor, rotulo]) => ({ valor, rotulo })),
      },
      {
        tipo: 'opcoes',
        chave: 'disponibilidade',
        rotulo: 'Disponibilidade',
        valorDoItem: (item) => (this.quantidadeDisponivel(item) > 0 ? 'DISPONIVEL' : 'INDISPONIVEL'),
        opcoes: [
          { valor: 'DISPONIVEL', rotulo: 'Disponível' },
          { valor: 'INDISPONIVEL', rotulo: 'Indisponível' },
        ],
      },
    ],
  };

  readonly usuariosFiltrados = computed(() =>
    filtrarItens(this.usuarios(), this.configUsuarios, this.filtrosUsuarios()),
  );

  readonly materiaisFiltrados = computed(() => {
    this.estado.itens(); // a disponibilidade muda conforme os materiais escolhidos
    return filtrarItens(this.materiais(), this.configMateriais, this.filtrosMateriais());
  });

  ngOnInit(): void {
    this.carregarDados();
  }

  rotuloTipo(tipo: string): string {
    return ROTULOS_TIPO[tipo] ?? tipo;
  }

  // ---------- Etapas ----------

  podeIrPara(etapa: EtapaEmprestimo): boolean {
    if (etapa === 1) return true;
    if (!this.estado.usuario()) return false;
    return etapa === 2 || this.estado.itens().length > 0;
  }

  irPara(etapa: EtapaEmprestimo): void {
    if (this.podeIrPara(etapa) && !this.salvando()) this.estado.etapa.set(etapa);
  }

  // ---------- 1. Leitor ----------

  selecionarUsuario(usuario: Usuario): void {
    if (usuario.estaBloqueado) {
      this.toastService.erro('Este leitor está bloqueado e não pode realizar empréstimos.');
      return;
    }
    this.estado.usuario.set(usuario);
    this.estado.emprestimosAbertos.set(0);
    this.estado.etapa.set(2);

    const consultaId = ++this.consultaEmprestimosId;
    if (usuario.id == null) return;
    this.emprestimoService.listarPorUsuario(usuario.id).subscribe({
      next: (emprestimos) => {
        if (consultaId !== this.consultaEmprestimosId) return;
        this.estado.emprestimosAbertos.set(
          emprestimos.filter((e) => e.status === 'ATIVO' || e.status === 'ATRASADO').length,
        );
      },
      error: (error) => {
        if (consultaId === this.consultaEmprestimosId) {
          this.toastService.erro(
            error.error?.message ?? 'Não foi possível consultar os empréstimos do leitor.',
          );
        }
      },
    });
  }

  removerUsuario(): void {
    this.consultaEmprestimosId++;
    this.estado.usuario.set(null);
    this.estado.emprestimosAbertos.set(0);
    this.estado.etapa.set(1);
  }

  // ---------- 2. Materiais ----------

  quantidadeDisponivel(material: MaterialParaEmprestimo): number {
    const escolhidos = this.estado.itens();
    return material.exemplaresDisponiveis.filter(
      (exemplar) => !escolhidos.some((item) => item.exemplarId === exemplar.id),
    ).length;
  }

  quantidadeEscolhida(material: MaterialParaEmprestimo): number {
    return this.estado.itens().filter((item) => item.material.material.id === material.material.id)
      .length;
  }

  selecionarMaterial(material: MaterialParaEmprestimo): void {
    if (this.estado.usuario() && this.estado.vagasRestantes() === 0) {
      this.toastService.aviso('O leitor já atingiu o limite de materiais emprestados.');
      return;
    }
    const exemplar = material.exemplaresDisponiveis.find(
      (item) => !this.estado.itens().some((escolhido) => escolhido.exemplarId === item.id),
    );
    if (!exemplar) {
      this.toastService.aviso('Não há exemplares disponíveis deste material.');
      return;
    }
    this.estado.itens.update((itens) => [...itens, { material, exemplarId: exemplar.id }]);
  }

  removerMaterial(item: ItemEmprestimo): void {
    this.estado.itens.update((itens) => itens.filter((i) => i.exemplarId !== item.exemplarId));
  }

  // ---------- 3. Confirmação ----------

  definirPrazo(dias: number): void {
    this.estado.dataDevolucao.set(dataDaquiA(dias));
  }

  prazoSelecionado(dias: number): boolean {
    return this.estado.dataDevolucao() === dataDaquiA(dias);
  }

  concluirReserva(): void {
    const usuario = this.estado.usuario();
    const itens = this.estado.itens();
    const dataDevolucao = this.estado.dataDevolucao();
    if (!usuario?.id || itens.length === 0 || !dataDevolucao) {
      this.toastService.aviso('Escolha o leitor, os materiais e a data de devolução.');
      return;
    }
    if (this.estado.limiteExcedido()) {
      this.toastService.erro('O leitor atingiu o limite de materiais emprestados.');
      return;
    }
    if (dataDevolucao < this.hoje) {
      this.toastService.aviso('A data de devolução não pode estar no passado.');
      return;
    }

    this.salvando.set(true);
    this.emprestimoService
      .criarLote({
        usuarioId: usuario.id,
        exemplarIds: itens.map((i) => i.exemplarId),
        dataDevolucaoPrevista: dataDevolucao,
      })
      .subscribe({
        next: (emprestimos) => {
          const n = emprestimos.length;
          this.toastService.sucesso(
            `${n} ${n === 1 ? 'empréstimo registrado' : 'empréstimos registrados'} para ${usuario.nome}.`,
          );
          this.consultaEmprestimosId++;
          this.estado.limpar();
          this.filtrosUsuarios.set({});
          this.filtrosMateriais.set({});
          this.salvando.set(false);
          this.carregarDados();
        },
        error: (error) => {
          this.salvando.set(false);
          this.toastService.erro(error.error?.message ?? 'Não foi possível registrar o empréstimo.');
        },
      });
  }

  carregarDados(): void {
    this.carregando.set(true);
    this.erroCarregamento.set('');
    forkJoin({
      usuarios: this.usuarioService.listarAlunos(),
      materiais: this.materialService.findAll(true),
      exemplares: this.exemplarService.findAll(true),
      autores: this.autorService.findAll(),
    }).subscribe({
      next: ({ usuarios, materiais, exemplares, autores }) => {
        this.usuarios.set(usuarios);
        const autoresPorId = new Map(autores.map((autor: AutorResponse) => [autor.id, autor.nome]));
        this.materiais.set(
          materiais
            .map((material: MaterialResponse) => {
              const autorIds = [
                ...new Set([
                  ...(material.autorIds ?? []),
                  ...(material.autorId ? [material.autorId] : []),
                ]),
              ];
              return {
                material,
                autor:
                  autorIds.map((id) => autoresPorId.get(id)).filter(Boolean).join(', ') ||
                  'Não informado',
                exemplaresDisponiveis: exemplares.filter(
                  (exemplar: ExemplarResponse) =>
                    exemplar.materialId === material.id && exemplar.status === 'DISPONIVEL',
                ),
              };
            })
            .sort((a, b) => a.material.titulo.localeCompare(b.material.titulo, 'pt-BR')),
        );
        this.carregando.set(false);
      },
      error: (error) => {
        this.carregando.set(false);
        this.erroCarregamento.set(
          error.error?.message ?? 'Não foi possível carregar os leitores e materiais.',
        );
      },
    });
  }
}
