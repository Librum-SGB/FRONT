import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../shared/services/toast.service';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CorpoPadrao } from '../../shared/component/corpo-padrao/corpo-padrao';
import { LbrButtom } from '../../shared/component/lbr-buttom/lbr-buttom';
import { FormUtils } from '../../utils/FormUtil';
import { AlertaErros } from '../../shared/component/alerta-erros/alerta-erros';

declare var bootstrap: any;

@Component({
  selector: 'app-editar-excluir-material',
  imports: [CommonModule, FormsModule, CorpoPadrao, LbrButtom, AlertaErros, ReactiveFormsModule],
  templateUrl: './editar-excluir-material.html',
  styleUrl: './editar-excluir-material.scss',
})
export class EditarExcluirMaterial {
  constructor(
    private toastService: ToastService,
    private fb: FormBuilder,
  ) {
    const anoAtual = new Date().getFullYear();

    this.formMaterial = this.fb.group({
      codigo: [{ value: '', disabled: true }],
      titulo: ['', Validators.required],
      subtitulo: [''],
      autor: ['', Validators.required],
      editora: ['', Validators.required],
      anoPublicacao: [null, [Validators.required, Validators.min(1000), Validators.max(anoAtual)]],
      isbn: ['', [Validators.minLength(10), Validators.maxLength(17)]], // opcional
      edicao: [''],
      genero: ['', Validators.required],
      exemplares: [1, [Validators.required, Validators.min(1)]],
    });
  }
  formMaterial: FormGroup;
  enviado = false;
  mensagensErro: string[] = [];

  private readonly nomesCampos: Record<string, string> = {
    titulo: 'Título',
    subtitulo: 'Subtítulo',
    autor: 'Autor',
    editora: 'Editora',
    anoPublicacao: 'Ano',
    isbn: 'ISBN',
    edicao: 'Edição',
    genero: 'Gênero',
    exemplares: 'Quantidade',
  };

  isInvalido(campo: string): boolean {
    return FormUtils.isInvalido(this.formMaterial, campo, this.enviado);
  }

  materiais = [
    {
      codigo: 'L-00001',
      titulo: 'Programação em Python',
      tipo: 'Livro',
      autor: 'João',
      editora: 'Novatec',
      anoPublicacao: 2020,
      genero: 'Tecnologia',
      localizacao: 'Estante A1',
      exemplares: 5,
      unidade: 'Central',
      disponibilidade: 'Disponível',
    },
    {
      codigo: 'L-00002',
      titulo: 'Gestão de Projetos Ágeis',
      tipo: 'Livro',
      autor: 'Maria',
      editora: 'Alta Books',
      anoPublicacao: 2019,
      genero: 'Administração',
      localizacao: 'Estante B2',
      exemplares: 3,
      unidade: 'Norte',
      disponibilidade: 'Disponível',
    },
    {
      codigo: 'L-00003',
      titulo: 'Eletrônica Digital Avançada',
      tipo: 'Livro',
      autor: 'Carlos',
      editora: 'Pearson',
      anoPublicacao: 2018,
      genero: 'Engenharia',
      localizacao: 'Estante C3',
      exemplares: 2,
      unidade: 'Sul',
      disponibilidade: 'Indisponível',
    },
    {
      codigo: 'P-00001',
      titulo: 'Revista Tecnologia Hoje',
      tipo: 'Livro',
      autor: 'Editora X',
      editora: 'Editora X',
      anoPublicacao: 2023,
      genero: 'Revista',
      localizacao: 'Estante D1',
      exemplares: 10,
      unidade: 'Central',
      disponibilidade: 'Disponível',
    },
  ];

  materialSelecionado: any;

  selecionarMaterial(material: any) {
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

  materialEditando: any = {};

  abrirEdicao(material: any) {
    if (!material) return;

    this.materialEditando = { ...material };

    this.formMaterial.reset({
      codigo: material.codigo,
      titulo: material.titulo,
      subtitulo: material.subtitulo ?? '',
      autor: material.autor,
      editora: material.editora,
      anoPublicacao: material.anoPublicacao,
      isbn: material.isbn ?? '',
      edicao: material.edicao ?? '',
      genero: material.genero,
      exemplares: material.exemplares,
    });

    this.enviado = false;
    this.mensagensErro = [];

    this.trocarModal('modalMaterial', 'modalEditar');
  }

  salvarEdicao() {
    this.enviado = true;
    this.mensagensErro = FormUtils.gerarMensagensErro(this.formMaterial, this.nomesCampos);

    if (this.formMaterial.invalid) return; // modal continua aberto, com o alerta

    // sincroniza para o modal de confirmação mostrar o título novo
    this.materialEditando = { ...this.materialEditando, ...this.formMaterial.getRawValue() };

    this.trocarModal('modalEditar', 'confirmarEdicaoMaterialModal');
  }

  cancelarConfirmacaoEdicao() {
    this.trocarModal('confirmarEdicaoMaterialModal', 'modalEditar');
  }

  confirmarEdicao() {
    const index = this.materiais.findIndex((m) => m.codigo === this.materialEditando.codigo);

    if (index !== -1) {
      this.materiais[index] = this.materialEditando;
      this.toastService.sucesso('Material editado com sucesso!');
    }

    bootstrap.Modal.getInstance(document.getElementById('confirmarEdicaoMaterialModal'))?.hide();
  }

  abrirModalExcluir(material: any) {
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

    this.materiais = this.materiais.filter((m) => m !== materialExcluido);
    this.toastService.sucesso(`Material "${materialExcluido.titulo}" excluído com sucesso.`);
    this.materialSelecionado = null;

    bootstrap.Modal.getInstance(document.getElementById('excluirMaterialModal'))?.hide();
  }

  tipoFiltro: string = 'todos';
  textoBusca: string = '';

  materiaisFiltrados() {
    const busca = this.textoBusca.toLowerCase();

    return this.materiais.filter((material) => {
      // Se não digitou nada, mostra tudo
      if (!busca) return true;

      switch (this.tipoFiltro) {
        case 'codigo':
          return material.codigo.toLowerCase().includes(busca);

        case 'titulo':
          return material.titulo.toLowerCase().includes(busca);

        case 'autor':
          return material.autor.toLowerCase().includes(busca);

        case 'genero':
          return material.genero.toLowerCase().includes(busca);

        case 'todos':
        default:
          return (
            material.codigo.toLowerCase().includes(busca) ||
            material.titulo.toLowerCase().includes(busca) ||
            material.autor.toLowerCase().includes(busca) ||
            material.genero.toLowerCase().includes(busca)
          );
      }
    });
  }
}
