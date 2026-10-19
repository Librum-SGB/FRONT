import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../shared/services/toast.service';
import { CorpoPadrao } from '../../shared/component/corpo-padrao/corpo-padrao';
import { LbrButtom } from '../../shared/component/lbr-buttom/lbr-buttom';
import { SelectPesquisavel } from '../../shared/component/select-pesquisavel/select-pesquisavel';

import { MaterialService } from '../../services/material';
import { AutorService } from '../../services/autor';
import { EditoraService } from '../../services/editora';
import { GeneroService } from '../../services/genero';

import { MaterialResponse, MaterialRequest } from '../../models/material.model';
import { AutorResponse } from '../../models/autor.model';
import { EditoraResponse } from '../../models/editora.model';
import { GeneroResponse } from '../../models/genero.model';

declare var bootstrap: any;

const PREFIXOS: Record<string, string> = {
  LIVRO: 'L',
  PERIODICO: 'P',
  OUTROS: 'OM',
};

const LABELS: Record<string, string> = {
  LIVRO: 'Livro',
  PERIODICO: 'Periódico',
  OUTROS: 'Outros Materiais',
};

// Formato usado só pra exibir na tela (já com os nomes resolvidos, não os IDs)
interface MaterialExibicao {
  id: number;
  codigo: string;
  titulo: string;
  subtitulo?: string;
  tipo: string;
  tipoLabel: string;
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
  imports: [CommonModule, FormsModule, CorpoPadrao, LbrButtom, SelectPesquisavel],
  templateUrl: './editar-excluir-material.html',
  styleUrl: './editar-excluir-material.scss',
})
export class EditarExcluirMaterial implements OnInit {
  materiais: MaterialExibicao[] = [];
  materialSelecionado: MaterialExibicao | null = null;
  materialEditando: any = {};

  autores: AutorResponse[] = [];
  editoras: EditoraResponse[] = [];
  generos: GeneroResponse[] = [];
  generoIdsEditando: number[] = [];

  carregando = true;

  @ViewChild('autorSelectEdicao') autorSelectEdicao?: SelectPesquisavel;
  @ViewChild('editoraSelectEdicao') editoraSelectEdicao?: SelectPesquisavel;
  @ViewChild('generoSelectEdicao') generoSelectEdicao?: SelectPesquisavel;

  tipoFiltro: string = 'todos';
  textoBusca: string = '';

  constructor(
    private toastService: ToastService,
    private materialService: MaterialService,
    private autorService: AutorService,
    private editoraService: EditoraService,
    private generoService: GeneroService,
  ) { }

  ngOnInit(): void {
    this.carregarDados();
  }

  private carregarDados(): void {
    this.carregando = true;

    this.autorService.findAll().subscribe({
      next: (data) => {
        this.autores = data;
        this.reprocessarNomes();
      },
      error: (err) => console.error('Erro ao carregar autores:', err),
    });

    this.editoraService.findAll().subscribe({
      next: (data) => {
        this.editoras = data;
        this.reprocessarNomes();
      },
      error: (err) => console.error('Erro ao carregar editoras:', err),
    });

    this.generoService.findAll().subscribe({
      next: (data) => {
        this.generos = data;
        this.reprocessarNomes();
      },
      error: (err) => console.error('Erro ao carregar gêneros:', err),
    });

    this.materialService.findAll().subscribe({
      next: (data) => {
        this.materiaisOriginais = data;
        this.reprocessarNomes();
        this.carregando = false;
      },
      error: (err) => {
        console.error('Erro ao carregar materiais:', err);
        this.toastService.erro('Erro ao carregar os materiais cadastrados.');
        this.carregando = false;
      },
    });
  }

  private materiaisOriginais: MaterialResponse[] = [];

  // Reprocessa a lista de exibição sempre que autores/editoras/gêneros ou materiais mudarem
  // (os 4 fetches do ngOnInit rodam em paralelo, sem ordem garantida)
  private reprocessarNomes(): void {
    if (this.materiaisOriginais.length === 0) return;
    this.materiais = this.materiaisOriginais.map((m) => this.paraExibicao(m));
  }

  private paraExibicao(m: MaterialResponse): MaterialExibicao {
    const autor = this.autores.find((a) => a.id === m.autorId);
    const editora = this.editoras.find((e) => e.id === m.editoraId);
    const generoIds = m.generoIds ?? [];
    const nomesGeneros = generoIds
      .map((id) => this.generos.find((g) => g.id === id)?.nome)
      .filter((nome): nome is string => !!nome)
      .join(', ');

    return {
      id: m.id,
      codigo: (PREFIXOS[m.tipo] ?? 'M') + '-' + String(m.id).padStart(5, '0'),
      titulo: m.titulo,
      subtitulo: m.subtitulo,
      tipo: m.tipo,
      tipoLabel: LABELS[m.tipo] ?? m.tipo,
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
      generoIds: this.generoIdsEditando.length > 0 ? this.generoIdsEditando : undefined,
    };

    this.materialService.update(e.id, payload).subscribe({
      next: (atualizado) => {
        const index = this.materiaisOriginais.findIndex((m) => m.id === e.id);
        if (index !== -1) {
          this.materiaisOriginais[index] = atualizado;
          this.reprocessarNomes();
        }
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
        this.materiaisOriginais = this.materiaisOriginais.filter((m) => m.id !== materialExcluido.id);
        this.reprocessarNomes();
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

  materiaisFiltrados() {
    const busca = this.textoBusca.toLowerCase();

    return this.materiais.filter((material) => {
      if (!busca) return true;

      switch (this.tipoFiltro) {
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
  }
}