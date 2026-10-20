import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ToastService } from '../../shared/services/toast.service';
import { CorpoPadrao } from '../../shared/component/corpo-padrao/corpo-padrao';
import { LbrButtom } from '../../shared/component/lbr-buttom/lbr-buttom';
import { AlertaErros } from '../../shared/component/alerta-erros/alerta-erros';
import { SelectPesquisavel } from '../../shared/component/select-pesquisavel/select-pesquisavel';
import { FormUtils } from '../../utils/FormUtil';

import { MaterialService } from '../../services/material';
import { AutorService } from '../../services/autor';
import { EditoraService } from '../../services/editora';
import { GeneroService } from '../../services/genero';

import { MaterialResponse, MaterialRequest } from '../../models/material.model';
import { AutorResponse } from '../../models/autor.model';
import { EditoraResponse } from '../../models/editora.model';
import { GeneroResponse } from '../../models/genero.model';

declare var bootstrap: any;

const PREFIXOS: Record<string, string> = { LIVRO: 'L', PERIODICO: 'P', OUTROS: 'OM' };
const LABELS: Record<string, string> = {
  LIVRO: 'Livro',
  PERIODICO: 'Periódico',
  OUTROS: 'Outros Materiais',
};

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
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CorpoPadrao,
    LbrButtom,
    AlertaErros,
    SelectPesquisavel,
  ],
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
  tipoFiltro = 'todos';
  textoBusca = '';

  formMaterial: FormGroup;
  enviado = false;
  mensagensErro: string[] = [];

  private materiaisOriginais: MaterialResponse[] = [];

  @ViewChild('autorSelectEdicao') autorSelectEdicao?: SelectPesquisavel;
  @ViewChild('editoraSelectEdicao') editoraSelectEdicao?: SelectPesquisavel;
  @ViewChild('generoSelectEdicao') generoSelectEdicao?: SelectPesquisavel;

  private readonly nomesBase: Record<string, string> = {
    titulo: 'Título',
    autorId: 'Autor',
    editoraId: 'Editora',
    anoPublicacao: 'Ano',
    isbn: 'ISBN',
    issn: 'ISSN',
    edicao: 'Edição',
    quantidadePaginas: 'Páginas',
    tema: 'Tema',
  };

  private get nomesCampos(): Record<string, string> {
    return this.materialEditando?.tipo === 'OUTROS'
      ? { ...this.nomesBase, titulo: 'Nome', tema: 'Tipo' }
      : this.nomesBase;
  }

  constructor(
    private toastService: ToastService,
    private fb: FormBuilder,
    private materialService: MaterialService,
    private autorService: AutorService,
    private editoraService: EditoraService,
    private generoService: GeneroService,
  ) {
    // validadores de cada campo são definidos por tipo em aplicarValidadores()
    this.formMaterial = this.fb.group({
      codigo: [{ value: '', disabled: true }],
      titulo: [''],
      subtitulo: [''],
      autorId: [''],
      editoraId: [''],
      anoPublicacao: [null],
      isbn: [''],
      issn: [''],
      edicao: [null],
      quantidadePaginas: [null, Validators.min(1)],
      sinopse: [''],
      tema: [''],
      descricao: [''],
      observacao: [''],
    });
  }

  ngOnInit(): void {
    this.carregarDados();
  }

  isInvalido(campo: string): boolean {
    return FormUtils.isInvalido(this.formMaterial, campo, this.enviado);
  }

  private aplicarValidadores(tipo: string): void {
    const anoMax = new Date().getFullYear();
    const req = Validators.required;
    const ano = [req, Validators.min(1000), Validators.max(anoMax)];

    const regras: Record<string, Record<string, ValidatorFn[]>> = {
      LIVRO: {
        titulo: [req],
        autorId: [req],
        editoraId: [req],
        anoPublicacao: ano,
        isbn: [req, Validators.minLength(10), Validators.maxLength(17)],
      },
      PERIODICO: {
        titulo: [req],
        editoraId: [req],
        edicao: [req, Validators.min(1)],
        anoPublicacao: ano,
        issn: [req],
      },
      OUTROS: {
        titulo: [req],
        tema: [req],
      },
    };

    ['titulo', 'autorId', 'editoraId', 'anoPublicacao', 'isbn', 'issn', 'edicao', 'tema'].forEach(
      (campo) => {
        const control = this.formMaterial.get(campo)!;
        control.setValidators(regras[tipo]?.[campo] ?? []);
        control.updateValueAndValidity({ emitEvent: false });
      },
    );
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

  // sem o "return" antecipado: ao excluir o último item a lista precisa esvaziar
  private reprocessarNomes(): void {
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
    this.aplicarValidadores(material.tipo);

    this.formMaterial.reset({
      codigo: material.codigo,
      titulo: material.titulo,
      subtitulo: material.subtitulo ?? '',
      autorId: material.autorId ?? '',
      editoraId: material.editoraId ?? '',
      anoPublicacao: material.anoPublicacao ?? null,
      isbn: material.isbn ?? '',
      issn: material.issn ?? '',
      edicao: material.edicao ?? null,
      quantidadePaginas: material.quantidadePaginas ?? null,
      sinopse: material.sinopse ?? '',
      tema: material.tema ?? '',
      descricao: material.descricao ?? '',
      observacao: material.observacao ?? '',
    });

    this.enviado = false;
    this.mensagensErro = [];
    this.generoIdsEditando = [...material.generoIds];

    this.trocarModal('modalMaterial', 'modalEditar');
  }

  salvarEdicao() {
    this.enviado = true;
    this.mensagensErro = FormUtils.gerarMensagensErro(this.formMaterial, this.nomesCampos);

    if (this.formMaterial.invalid) return; // modal continua aberto, com o alerta

    // sincroniza para a confirmação e para o payload usarem os valores novos
    const { codigo, ...valores } = this.formMaterial.getRawValue();
    this.materialEditando = { ...this.materialEditando, ...valores };

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
        bootstrap.Modal.getInstance(
          document.getElementById('confirmarEdicaoMaterialModal'),
        )?.hide();
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
        this.materiaisOriginais = this.materiaisOriginais.filter(
          (m) => m.id !== materialExcluido.id,
        );
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
