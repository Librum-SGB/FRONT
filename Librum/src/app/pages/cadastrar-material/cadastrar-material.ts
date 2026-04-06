import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-cadastrar-material',
  imports: [FormsModule],
  templateUrl: './cadastrar-material.html',
  styleUrl: './cadastrar-material.scss',
})
export class CadastrarMaterial {
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

  constructor(private toastService: ToastService) {}

  salvar() {
    if (!this.titulo.trim()) {
      this.toastService.showToast('error', 'O campo Título é obrigatório.');
      return;
    }
    if (!this.autor.trim()) {
      this.toastService.showToast('error', 'O campo Autor é obrigatório.');
      return;
    }
    if (!this.editora.trim()) {
      this.toastService.showToast('error', 'O campo Editora é obrigatório.');
      return;
    }
    if (!this.anoPublicacao.trim()) {
      this.toastService.showToast('error', 'O campo Ano de Publicação é obrigatório.');
      return;
    }
    if (!this.isbn.trim()) {
      this.toastService.showToast('error', 'O campo ISBN é obrigatório.');
      return;
    }

    this.toastService.showToast('success', 'Livro cadastrado com sucesso!');
  }

  cancelar() {
    this.toastService.showToast('info', 'Cadastro cancelado.');
  }
}
