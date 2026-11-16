import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ToastService } from '../../shared/services/toast.service';
import { ConfirmacaoService } from '../../shared/services/confirmacao.service';
import { AuthService } from '../../services/auth.service';
import { Permissao } from '../../enum/permissoes.enum';
import { AcaoMenu, LbrAcoes } from '../../shared/component/lbr-acoes/lbr-acoes';
import { CorpoPadrao } from '../../shared/component/corpo-padrao/corpo-padrao';
import { LbrLinkEntidade } from '../../shared/component/lbr-link-entidade/lbr-link-entidade';
import { LbrButtom } from '../../shared/component/lbr-buttom/lbr-buttom';
import { LbrBadge } from '../../shared/component/lbr-badge/lbr-badge';
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

import { MaterialService } from '../../services/material';
import { AutorService } from '../../services/autor';
import { EditoraService } from '../../services/editora';
import { GeneroService } from '../../services/genero';
import { ExemplarService } from '../../services/exemplar';

import { MaterialResponse } from '../../models/material.model';
import { AutorResponse } from '../../models/autor.model';
import { EditoraResponse } from '../../models/editora.model';
import { GeneroResponse } from '../../models/genero.model';
import { ExemplarResponse } from '../../models/exemplar.model';
import {
  MaterialExibicao,
  materiaisComExemplarDisponivel,
  paraMaterialExibicao,
} from '../../utils/material.util';

const porNome = <T extends { id: number; nome: string }>(itens: T[]) =>
  itens
    .map((i) => ({ valor: i.id, rotulo: i.nome }))
    .sort((a, b) => a.rotulo.localeCompare(b.rotulo, 'pt-BR'));

@Component({
  selector: 'app-editar-excluir-material',
  imports: [
    CorpoPadrao,
    LbrLinkEntidade,
    LbrButtom,
    LbrBadge,
    LbrFiltros,
    LbrAcoes,
    RouterLink,
    LbrTabela,
    LbrTabelaCabecalho,
    LbrTabelaLinha,
    LbrTabelaOrdenar,
  ],
  templateUrl: './editar-excluir-material.html',
  styleUrl: './editar-excluir-material.scss',
})
export class EditarExcluirMaterial implements OnInit {
  protected readonly temFiltroAtivo = temFiltroAtivo;

  // ---------- Dados da API (signals) ----------
  private materiaisOriginais = signal<MaterialResponse[]>([]);
  private autores = signal<AutorResponse[]>([]);
  private editoras = signal<EditoraResponse[]>([]);
  private generos = signal<GeneroResponse[]>([]);
  /** `null` enquanto os exemplares não foram carregados (ou se falharem). */
  private exemplares = signal<ExemplarResponse[] | null>(null);
  carregando = signal(true);

  materiais = computed(() => {
    const exemplares = this.exemplares();
    const referencias = {
      autores: this.autores(),
      editoras: this.editoras(),
      generos: this.generos(),
      materiaisDisponiveis: exemplares ? materiaisComExemplarDisponivel(exemplares) : undefined,
    };
    return this.materiaisOriginais().map((m) => paraMaterialExibicao(m, referencias));
  });

  // ---------- Filtros ----------
  readonly filtros = signal<ValoresFiltro>({});

  readonly configFiltro = computed<ConfigFiltro<MaterialExibicao>>(() => ({
    placeholderBusca: 'Buscar por título, código, autor, editora ou ISBN...',
    busca: (m) => [m.codigo, m.titulo, m.subtitulo, m.autorNome, m.editoraNome, m.generoNomes, m.isbn, m.issn],
    campos: [
      {
        tipo: 'opcoes',
        chave: 'tipo',
        rotulo: 'Tipo',
        valorDoItem: (m) => m.tipo,
        opcoes: [
          { valor: 'LIVRO', rotulo: 'Livro' },
          { valor: 'PERIODICO', rotulo: 'Periódico' },
          { valor: 'OUTRO', rotulo: 'Outros' },
        ],
      },
      {
        tipo: 'opcoes',
        chave: 'disponibilidade',
        rotulo: 'Disponibilidade',
        valorDoItem: (m) => m.disponibilidade,
        opcoes: [
          { valor: 'Disponível', rotulo: 'Disponível' },
          { valor: 'Indisponível', rotulo: 'Indisponível' },
        ],
      },
      {
        tipo: 'lista',
        chave: 'genero',
        rotulo: 'Gênero',
        valorDoItem: (m) => m.generoIds,
        opcoes: porNome(this.generos()),
      },
      {
        tipo: 'lista',
        chave: 'autor',
        rotulo: 'Autor',
        valorDoItem: (m) => m.autorId,
        opcoes: porNome(this.autores()),
      },
      {
        tipo: 'lista',
        chave: 'editora',
        rotulo: 'Editora',
        valorDoItem: (m) => m.editoraId,
        opcoes: porNome(this.editoras()),
      },
    ],
  }));

  materiaisFiltrados = computed(() =>
    filtrarItens(this.materiais(), this.configFiltro(), this.filtros()),
  );

  private readonly authService = inject(AuthService);
  private readonly confirmacao = inject(ConfirmacaoService);

  acoesDoMaterial(material: MaterialExibicao): AcaoMenu[] {
    return [
      { rotulo: 'Ver detalhes', icone: 'bi-eye', rota: ['/materiais', material.id] },
      {
        rotulo: 'Ver histórico',
        icone: 'bi-clock-history',
        rota: '/historicoEmprestimo',
        queryParams: { material: material.id },
      },
      {
        rotulo: 'Editar',
        icone: 'bi-pencil',
        rota: ['/materiais', material.id, 'editar'],
        visivel: this.authService.temPermissao(Permissao.EDITAR_MATERIAL),
      },
      {
        rotulo: 'Excluir',
        icone: 'bi-trash',
        perigo: true,
        separadorAntes: true,
        visivel: this.authService.temPermissao(Permissao.EXCLUIR_MATERIAL),
        executar: () => void this.excluir(material),
      },
    ];
  }

  async excluir(material: MaterialExibicao): Promise<void> {
    const exemplares = this.exemplares()?.filter((e) => e.materialId === material.id).length;
    const confirmado = await this.confirmacao.confirmar({
      titulo: 'Excluir material',
      icone: 'bi-trash',
      tom: 'danger',
      mensagem: 'Você está excluindo este material do acervo.',
      detalhes: [
        { rotulo: 'Código', valor: material.codigo },
        { rotulo: 'Título', valor: material.titulo, destaque: true },
        { rotulo: 'Tipo', valor: material.tipoLabel },
        ...(exemplares != null ? [{ rotulo: 'Exemplares', valor: String(exemplares) }] : []),
      ],
      aviso: 'O material deixa de aparecer no acervo e nas buscas.',
      textoConfirmar: 'Excluir material',
    });
    if (!confirmado) return;

    this.materialService.delete(material.id).subscribe({
      next: () => {
        this.materiaisOriginais.update((lista) => lista.filter((m) => m.id !== material.id));
        this.toastService.sucesso(`Material "${material.titulo}" excluído com sucesso.`);
      },
      error: (err) => {
        console.error('Erro ao excluir material:', err);
        this.toastService.erro(err.error?.message ?? 'Erro ao excluir o material.');
      },
    });
  }

  constructor(
    private toastService: ToastService,
    private materialService: MaterialService,
    private autorService: AutorService,
    private editoraService: EditoraService,
    private generoService: GeneroService,
    private exemplarService: ExemplarService,
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  private carregarDados(): void {
    this.carregando.set(true);

    this.autorService.findAll().subscribe({
      next: (data) => this.autores.set(data),
      error: (err) => console.error('Erro ao carregar autores:', err),
    });

    this.editoraService.findAll().subscribe({
      next: (data) => this.editoras.set(data),
      error: (err) => console.error('Erro ao carregar editoras:', err),
    });

    this.generoService.findAll().subscribe({
      next: (data) => this.generos.set(data),
      error: (err) => console.error('Erro ao carregar gêneros:', err),
    });

    this.exemplarService.findAll().subscribe({
      next: (data) => this.exemplares.set(data),
      // se falhar, a etiqueta de disponibilidade simplesmente não aparece
      error: (err) => console.error('Erro ao carregar exemplares:', err),
    });

    this.materialService.findAll().subscribe({
      next: (data) => {
        // ordena por ID pra a lista não "embaralhar" entre carregamentos
        this.materiaisOriginais.set([...data].sort((a, b) => a.id - b.id));
        this.carregando.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar materiais:', err);
        this.toastService.erro('Erro ao carregar os materiais cadastrados.');
        this.carregando.set(false);
      },
    });
  }
}
