import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../shared/services/toast.service';
import { CorpoPadrao } from '../../shared/component/corpo-padrao/corpo-padrao';
import { LbrButtom } from '../../shared/component/lbr-buttom/lbr-buttom';
import { SelectPesquisavel } from '../../shared/component/select-pesquisavel/select-pesquisavel';
import { LbrBadge, LbrBadgeVariant } from '../../shared/component/lbr-badge/lbr-badge';

import { MaterialService } from '../../services/material';
import { AutorService } from '../../services/autor';
import { EditoraService } from '../../services/editora';
import { GeneroService } from '../../services/genero';
import { ExemplarService } from '../../services/exemplar';

import { MaterialResponse, MaterialRequest } from '../../models/material.model';
import { AutorResponse } from '../../models/autor.model';
import { EditoraResponse } from '../../models/editora.model';
import { GeneroResponse } from '../../models/genero.model';
import { ExemplarResponse } from '../../models/exemplar.model';

declare var bootstrap: any;

const ITENS_POR_PAGINA = 20;

// Valor do enum StatusExemplar que significa "pode ser emprestado".
// Se no backend o nome for outro, é só trocar aqui.
const STATUS_DISPONIVEL = 'DISPONIVEL';

const PREFIXOS: Record<string, string> = {
  LIVRO: 'L',
  PERIODICO: 'P',
  OUTRO: 'OM',
};

const LABELS: Record<string, string> = {
  LIVRO: 'Livro',
  PERIODICO: 'Periódico',
  OUTRO: 'Outros Materiais',
};

const VARIANTS: Record<string, LbrBadgeVariant> = {
  LIVRO: 'livro',
  PERIODICO: 'periodico',
  OUTRO: 'outros',
};

// Formato usado só pra exibir na tela (já com os nomes resolvidos, não os IDs)
interface MaterialExibicao {
  id: number;
  codigo: string;
  titulo: string;
  subtitulo?: string;
  tipo: string;
  tipoLabel: string;
  tipoVariant: LbrBadgeVariant;
  disponibilidade?: 'Disponível' | 'Indisponível';
  disponibilidadeVariant?: LbrBadgeVariant;
  autorId?: number;
  autorNome: string;
  editoraId?: number;
  editoraNome: string;
  anoPublicacao?: number;
  isbn?: string;
  edicao?: number;
  quantidadePaginas?: number;
  sinopse?: string;
  issn?: string;
  tema?: string;
  descricao?: string;
  observacao?: string;
  generoIds: number[];
  generoNomes: string;
}

@Component({
  selector: 'app-editar-excluir-material',
  imports: [CommonModule, FormsModule, CorpoPadrao, LbrButtom, SelectPesquisavel, LbrBadge],
  templateUrl: './editar-excluir-material.html',
  styleUrl: './editar-excluir-material.scss',
})
export class EditarExcluirMaterial implements OnInit {
  readonly itensPorPagina = ITENS_POR_PAGINA;

  // Dados que chegam da API (signals: a tela atualiza sozinha quando eles mudam)
  private materiaisOriginais = signal<MaterialResponse[]>([]);
  autores = signal<AutorResponse[]>([]);
  editoras = signal<EditoraResponse[]>([]);
  generos = signal<GeneroResponse[]>([]);
  private exemplares = signal<ExemplarResponse[]>([]);
  private exemplaresCarregados = signal(false);
  carregando = signal(true);

  // Busca e paginação
  tipoFiltro = signal('todos');
  textoBusca = signal('');
  paginaAtual = signal(1);

  // IDs dos materiais que têm pelo menos 1 exemplar disponível
  private materiaisComExemplarDisponivel = computed(
    () =>
      new Set(
        this.exemplares()
          .filter((e) => e.status === STATUS_DISPONIVEL)
          .map((e) => e.materialId),
      ),
  );

  materiais = computed(() => this.materiaisOriginais().map((m) => this.paraExibicao(m)));

  materiaisFiltrados = computed(() => {
    const busca = this.textoBusca().toLowerCase().trim();
    if (!busca) return this.materiais();

    const filtro = this.tipoFiltro();

    return this.materiais().filter((material) => {
      switch (filtro) {
        case 'codigo':
          return material.codigo.toLowerCase().includes(busca);
        case 'titulo':
          return material.titulo.toLowerCase().includes(busca);
        case 'autor':
          return material.autorNome.toLowerCase().includes(busca);
        case 'genero':
          return material.generoNomes.toLowerCase().includes(busca);
        case 'todos':
        default:
          return (
            material.codigo.toLowerCase().includes(busca) ||
            material.titulo.toLowerCase().includes(busca) ||
            material.autorNome.toLowerCase().includes(busca) ||
            material.generoNomes.toLowerCase().includes(busca)
          );
      }
    });
  });

  totalPaginas = computed(() =>
    Math.max(1, Math.ceil(this.materiaisFiltrados().length / ITENS_POR_PAGINA)),
  );

  // Se a página atual deixar de existir (ex.: excluiu o último item da última página), volta pra última
  paginaEfetiva = computed(() => Math.min(this.paginaAtual(), this.totalPaginas()));

  materiaisPagina = computed(() => {
    const inicio = (this.paginaEfetiva() - 1) * ITENS_POR_PAGINA;
    return this.materiaisFiltrados().slice(inicio, inicio + ITENS_POR_PAGINA);
  });

  inicioExibicao = computed(() =>
    this.materiaisFiltrados().length === 0 ? 0 : (this.paginaEfetiva() - 1) * ITENS_POR_PAGINA + 1,
  );

  fimExibicao = computed(() =>
    Math.min(this.paginaEfetiva() * ITENS_POR_PAGINA, this.materiaisFiltrados().length),
  );

  // Janela de até 5 números de página ao redor da atual
  paginasVisiveis = computed(() => {
    const total = this.totalPaginas();
    const atual = this.paginaEfetiva();
    const janela = 5;

    let inicio = Math.max(1, atual - Math.floor(janela / 2));
    const fim = Math.min(total, inicio + janela - 1);
    inicio = Math.max(1, fim - janela + 1);

    return Array.from({ length: fim - inicio + 1 }, (_, i) => inicio + i);
  });

  materialSelecionado: MaterialExibicao | null = null;
  materialEditando: any = {};
  generoIdsEditando: number[] = [];

  constructor(
    private toastService: ToastService,
    private materialService: MaterialService,
    private autorService: AutorService,
    private editoraService: EditoraService,
    private generoService: GeneroService,
    private exemplarService: ExemplarService,
  ) { }

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
      next: (data) => {
        this.exemplares.set(data);
        this.exemplaresCarregados.set(true);
      },
      // se falhar, a etiqueta de disponibilidade simplesmente não aparece
      error: (err) => console.error('Erro ao carregar exemplares:', err),
    });

    this.materialService.findAll().subscribe({
      next: (data) => {
        // ordena por ID pra a lista não "embaralhar" depois de uma edição
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

  private paraExibicao(m: MaterialResponse): MaterialExibicao {
    const autor = this.autores().find((a) => a.id === m.autorId);
    const editora = this.editoras().find((e) => e.id === m.editoraId);
    const generoIds = m.generoIds ?? [];
    const nomesGeneros = generoIds
      .map((id) => this.generos().find((g) => g.id === id)?.nome)
      .filter((nome): nome is string => !!nome)
      .join(', ');

    let disponibilidade: MaterialExibicao['disponibilidade'];
    let disponibilidadeVariant: LbrBadgeVariant | undefined;

    if (this.exemplaresCarregados()) {
      const disponivel = this.materiaisComExemplarDisponivel().has(m.id);
      disponibilidade = disponivel ? 'Disponível' : 'Indisponível';
      disponibilidadeVariant = disponivel ? 'disponivel' : 'indisponivel';
    }

    return {
      id: m.id,
      codigo: (PREFIXOS[m.tipo] ?? 'M') + '-' + String(m.id).padStart(5, '0'),
      titulo: m.titulo,
      subtitulo: m.subtitulo,
      tipo: m.tipo,
      tipoLabel: LABELS[m.tipo] ?? m.tipo,
      tipoVariant: VARIANTS[m.tipo] ?? 'outros',
      disponibilidade,
      disponibilidadeVariant,
      autorId: m.autorId,
      autorNome: autor?.nome ?? '—',
      editoraId: m.editoraId,
      editoraNome: editora?.nome ?? '—',
      anoPublicacao: m.anoPublicacao,
      isbn: m.isbn,
      edicao: m.edicao,
      quantidadePaginas: m.quantidadePaginas,
      sinopse: m.sinopse,
      issn: m.issn,
      tema: m.tema,
      descricao: m.descricao,
      observacao: m.observacao,
      generoIds,
      generoNomes: nomesGeneros || '—',
    };
  }

  trackById(_: number, material: MaterialExibicao): number {
    return material.id;
  }

  // ---------- Busca e paginação ----------

  onFiltroChange(valor: string): void {
    this.tipoFiltro.set(valor);
    this.paginaAtual.set(1);
  }

  onBuscaChange(valor: string): void {
    this.textoBusca.set(valor);
    this.paginaAtual.set(1);
  }

  irParaPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas()) return;
    this.paginaAtual.set(pagina);
  }

  // ---------- Modais ----------

  selecionarMaterial(material: MaterialExibicao) {
    this.materialSelecionado = material;
  }

  private trocarModal(modalAtualId: string, proximoModalId: string): void {
    const modalAtualElemento = document.getElementById(modalAtualId);
    const proximoModalElemento = document.getElementById(proximoModalId);

    if (!proximoModalElemento) return;

    const abrirProximoModal = () => {
      bootstrap.Modal.getOrCreateInstance(proximoModalElemento).show();
    };

    if (!modalAtualElemento) {
      abrirProximoModal();
      return;
    }

    const modalAtual = bootstrap.Modal.getInstance(modalAtualElemento);

    if (!modalAtual) {
      abrirProximoModal();
      return;
    }

    modalAtualElemento.addEventListener('hidden.bs.modal', abrirProximoModal, { once: true });
    modalAtual.hide();
  }

  abrirEdicao(material: MaterialExibicao | null) {
    if (!material) return;

    this.materialEditando = { ...material };
    this.generoIdsEditando = [...material.generoIds];
    this.trocarModal('modalMaterial', 'modalEditar');
  }

  salvarEdicao() {
    this.trocarModal('modalEditar', 'confirmarEdicaoMaterialModal');
  }

  cancelarConfirmacaoEdicao() {
    this.trocarModal('confirmarEdicaoMaterialModal', 'modalEditar');
  }

  confirmarEdicao() {
    const e = this.materialEditando;

    const payload: MaterialRequest = {
      tipo: e.tipo,
      titulo: e.titulo,
      subtitulo: e.subtitulo || undefined,
      autorId: e.autorId ? Number(e.autorId) : undefined,
      editoraId: e.editoraId ? Number(e.editoraId) : undefined,
      anoPublicacao: e.anoPublicacao ? Number(e.anoPublicacao) : undefined,
      isbn: e.isbn || undefined,
      edicao: e.edicao ? Number(e.edicao) : undefined,
      quantidadePaginas: e.quantidadePaginas ? Number(e.quantidadePaginas) : undefined,
      sinopse: e.sinopse || undefined,
      issn: e.issn || undefined,
      tema: e.tema || undefined,
      descricao: e.descricao || undefined,
      observacao: e.observacao || undefined,
      // no livro, manda sempre a lista (mesmo vazia) pra remover todos os gêneros funcionar
      generoIds: e.tipo === 'LIVRO' ? this.generoIdsEditando : undefined,
    };

    this.materialService.update(e.id, payload).subscribe({
      next: (atualizado) => {
        this.materiaisOriginais.update((lista) =>
          lista.map((m) => (m.id === atualizado.id ? atualizado : m)),
        );
        this.toastService.sucesso('Material editado com sucesso!');
        bootstrap.Modal.getInstance(document.getElementById('confirmarEdicaoMaterialModal'))?.hide();
      },
      error: (err) => {
        console.error('Erro ao editar material:', err);
        this.toastService.erro('Erro ao salvar as alterações. Verifique os dados.');
      },
    });
  }

  abrirModalExcluir(material: MaterialExibicao | null) {
    if (!material) return;

    this.materialSelecionado = material;
    this.trocarModal('modalMaterial', 'excluirMaterialModal');
  }

  cancelarExclusao() {
    this.trocarModal('excluirMaterialModal', 'modalMaterial');
  }

  confirmarExclusao() {
    if (!this.materialSelecionado) return;

    const materialExcluido = this.materialSelecionado;

    this.materialService.delete(materialExcluido.id).subscribe({
      next: () => {
        this.materiaisOriginais.update((lista) => lista.filter((m) => m.id !== materialExcluido.id));
        this.toastService.sucesso(`Material "${materialExcluido.titulo}" excluído com sucesso.`);
        this.materialSelecionado = null;
        bootstrap.Modal.getInstance(document.getElementById('excluirMaterialModal'))?.hide();
      },
      error: (err) => {
        console.error('Erro ao excluir material:', err);
        this.toastService.erro('Erro ao excluir o material.');
      },
    });
  }
}