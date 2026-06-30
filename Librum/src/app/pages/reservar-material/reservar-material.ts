import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-reservar-material',
  imports: [CommonModule, FormsModule],
  templateUrl: './reservar-material.html',
  styleUrl: './reservar-material.scss',
})
export class ReservarMaterial {
  constructor(private toastService: ToastService) {}

  livros = [
    { id: 1, titulo: 'Programacao em Python', disponiveis: 3 },
    { id: 2, titulo: 'JavaScript Avancado', disponiveis: 2 },
    { id: 3, titulo: 'React e Redux', disponiveis: 4 },
    { id: 4, titulo: 'Angular na Pratica', disponiveis: 5 },
    { id: 5, titulo: 'Banco de Dados NoSQL', disponiveis: 1 },
    { id: 6, titulo: 'TypeScript Guide', disponiveis: 6 },
  ];

  usuarios = [
    { id: 1, nome: 'Joao Pedro Silva', email: 'joao@email.com', estaBloqueado: false },
    { id: 2, nome: 'Maria Eduarda Santos', email: 'maria@email.com', estaBloqueado: false },
    { id: 3, nome: 'Laura Savi Bressan', email: 'laura@email.com', estaBloqueado: true },
  ];

  materiaisSelecionados: any[] = [];
  usuarioSelecionado: any = null;
  etapaAtual = 1;
  mensagem = '';
  buscaMaterial = '';
  buscaUsuario = '';

  get livrosFiltrados() {
    return this.livros.filter((livro) =>
      livro.titulo.toLowerCase().includes(this.buscaMaterial.toLowerCase()) ||
      livro.id.toString().includes(this.buscaMaterial),
    );
  }

  get usuariosFiltrados() {
    return this.usuarios.filter((usuario) =>
      usuario.nome.toLowerCase().includes(this.buscaUsuario.toLowerCase()) ||
      usuario.id.toString().includes(this.buscaUsuario),
    );
  }

  selecionarMaterial(livro: any) {
    if (!this.materiaisSelecionados.includes(livro)) {
      this.materiaisSelecionados.push(livro);
    }
  }

  removerMaterial(livro: any) {
    this.materiaisSelecionados = this.materiaisSelecionados.filter((material) => material !== livro);
  }

  continuar() {
    if (this.materiaisSelecionados.length > 0) {
      this.etapaAtual = 2;
    }
  }

  voltar() {
    this.etapaAtual = 1;
    this.usuarioSelecionado = null;
  }

  selecionarUsuario(usuario: any) {
    this.usuarioSelecionado = usuario;
  }

  concluirReserva() {
    if (this.materiaisSelecionados.length > 0 && this.usuarioSelecionado) {
      this.toastService.sucesso('Reserva concluida com sucesso!');
      this.materiaisSelecionados = [];
      this.usuarioSelecionado = null;
      this.etapaAtual = 1;
    }
  }
}
