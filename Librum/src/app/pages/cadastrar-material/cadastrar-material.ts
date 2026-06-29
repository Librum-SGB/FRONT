import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ToastService } from '../../shared/services/toast.service';
import { IMaskDirective } from 'angular-imask';
import { MaskConstants } from '../../enum/const';

@Component({
  selector: 'app-cadastrar-material',
  imports: [FormsModule, CommonModule, IMaskDirective],
  templateUrl: './cadastrar-material.html',
  styleUrl: './cadastrar-material.scss',
})
export class CadastrarMaterial {
  tipoMaterial: string = 'livro';
  protected readonly Mask = MaskConstants;

  // LIVRO
  id = '';
  titulo = '';
  subtitulo = '';
  autor = '';
  editora = '';
  anoPublicacao = '';
  isbn = '';
  edicao = '';
  genero = '';
  quantidadeExemplares = '';
  sinopse = '';
  localizacao = '';
  unidade = '';
  dataAquisicao = '';

  // PERIÓDICO
  tituloPeriodico = '';
  editor = '';
  edicaoVolumeNumero = '';
  dataPublicacao = '';
  issn = '';
  tema = '';
  descricaoPeriodico = '';
  quantidadeExemplaresPeriodico = '';
  localizacaoPeriodico = '';
  unidadePeriodico = '';

  // OUTROS MATERIAIS
  nomeMaterial = '';
  tipoOutroMaterial = '';
  autorMaterial = '';
  descricaoMaterial = '';
  quantidadeMaterial = '';
  localizacaoMaterial = '';
  unidadeMaterial = '';
  observacao = '';

  constructor(private toastService: ToastService) {}

  selecionarTipo(tipo: string) {
    this.tipoMaterial = tipo;
  }

  salvar() {
    // LIVRO
    if (this.tipoMaterial === 'livro') {
      if (!this.titulo.trim()) {
        this.toastService.erro('O campo Título é obrigatório.');
        return;
      }

      if (!this.autor.trim()) {
        this.toastService.erro('O campo Autor é obrigatório.');
        return;
      }

      if (!this.editora.trim()) {
        this.toastService.erro('O campo Editora é obrigatório.');
        return;
      }

      if (!this.anoPublicacao.trim()) {
        this.toastService.erro('O campo Ano de Publicação é obrigatório.');
        return;
      }

      if (!this.isbn.trim()) {
        this.toastService.erro('O campo ISBN é obrigatório.');
        return;
      }

      this.toastService.sucesso('Livro cadastrado com sucesso!');
    }

    // PERIÓDICO
    else if (this.tipoMaterial === 'periodico') {
      if (!this.tituloPeriodico.trim()) {
        this.toastService.erro('O campo Título é obrigatório.');
        return;
      }

      if (!this.editor.trim()) {
        this.toastService.erro('O campo Editor é obrigatório.');
        return;
      }

      if (!this.edicaoVolumeNumero.trim()) {
        this.toastService.erro('O campo Edição/Volume/Número é obrigatório.');
        return;
      }

      if (!this.issn.trim()) {
        this.toastService.erro('O campo ISSN é obrigatório.');
        return;
      }

      this.toastService.sucesso('Periódico cadastrado com sucesso!');
    }

    // OUTROS MATERIAIS
    else if (this.tipoMaterial === 'outros') {
      if (!this.nomeMaterial.trim()) {
        this.toastService.erro('O campo Nome é obrigatório.');
        return;
      }

      if (!this.tipoOutroMaterial.trim()) {
        this.toastService.erro('O campo Tipo é obrigatório.');
        return;
      }

      this.toastService.sucesso('Material cadastrado com sucesso!');
    }
  }

  cancelar() {
    this.toastService.aviso('Cadastro cancelado.');
  }
}
