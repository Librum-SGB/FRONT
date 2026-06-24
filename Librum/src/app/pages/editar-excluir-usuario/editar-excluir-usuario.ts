import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../models/usuario.model';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../shared/services/toast.service';

declare var bootstrap: any;

@Component({
  selector: 'app-editar-excluir-usuario',
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './editar-excluir-usuario.html',
  styleUrl: './editar-excluir-usuario.scss',
})
export class EditarExcluirUsuario {
  filtro = 'nome';
  busca = '';

  usuarioSelecionado: Usuario | null = null;
  usuarioEditando: Usuario = {} as Usuario;

  constructor(
    private cdr: ChangeDetectorRef,
    private toastService: ToastService,
  ) {}

  usuarios: Usuario[] = [
    {
      id: 1,
      nome: 'João Pedro Silva',
      cpf: '123.456.789-00',
      email: 'joao@email.com',
      telefone: '(11) 99999-9999',
      dataNascimento: new Date('2000-05-10'),
      filialId: 1,
      endereco: 'Rua A, 100',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01000-000',
      limiteLivros: 3,
      estaBloqueado: false,
      dataCriacao: new Date(),
      dataUltimaAtualizacao: new Date(),
      foto: 'https://cdn-icons-png.flaticon.com/512/847/847969.png',
    },
    {
      id: 2,
      nome: 'Maria Eduarda Santos',
      cpf: '987.654.321-00',
      email: 'maria@email.com',
      telefone: '(11) 98888-8888',
      dataNascimento: new Date('1998-07-22'),
      filialId: 1,
      endereco: 'Av Paulista, 1000',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01310-100',
      limiteLivros: 5,
      estaBloqueado: false,
      dataCriacao: new Date(),
      dataUltimaAtualizacao: new Date(),
      foto: 'https://cdn-icons-png.flaticon.com/512/847/847969.png',
    },
    {
      id: 3,
      nome: 'Laura Savi Bressan',
      cpf: '987.654.321-00',
      email: 'laura@email.com',
      telefone: '(11) 98888-8888',
      dataNascimento: new Date('2006-07-03'),
      filialId: 1,
      endereco: 'Av Paulista, 1000',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01310-100',
      limiteLivros: 5,
      estaBloqueado: true,
      dataCriacao: new Date(),
      dataUltimaAtualizacao: new Date(),
      foto: 'https://cdn-icons-png.flaticon.com/512/847/847969.png',
    },
  ];

  usuariosFiltrados(): Usuario[] {
    return this.usuarios.filter((usuario) => {
      const valor = this.busca.toLowerCase();

      return this.filtro === 'nome'
        ? usuario.nome.toLowerCase().includes(valor)
        : usuario.id?.toString().includes(valor);
    });
  }

  selecionarUsuario(usuario: Usuario): void {
    this.usuarioSelecionado = usuario;
  }

  editarUsuario(): void {
    if (!this.usuarioSelecionado) return;

    this.usuarioEditando = { ...this.usuarioSelecionado };

    bootstrap.Modal.getInstance(document.getElementById('modalUsuario'))?.hide();

    new bootstrap.Modal(document.getElementById('editarModal')).show();
  }

  salvarEdicao(): void {
    const index = this.usuarios.findIndex((usuario) => usuario.id === this.usuarioEditando.id);

    if (index !== -1) {
      this.usuarioEditando.dataUltimaAtualizacao = new Date();

      this.usuarios[index] = { ...this.usuarioEditando };
      this.usuarioSelecionado = { ...this.usuarioEditando };

      this.toastService.sucesso('Usuário editado com sucesso!');
    }

    bootstrap.Modal.getInstance(document.getElementById('editarModal'))?.hide();
  }

  abrirModalExcluir(): void {
    new bootstrap.Modal(document.getElementById('excluirModal')).show();
  }

  confirmarExclusao(): void {
    if (!this.usuarioSelecionado) return;

    this.usuarios = this.usuarios.filter((usuario) => usuario.id !== this.usuarioSelecionado?.id);

    this.toastService.sucesso('Usuário excluído com sucesso!');
    this.usuarioSelecionado = null;

    bootstrap.Modal.getInstance(document.getElementById('excluirModal'))?.hide();

    bootstrap.Modal.getInstance(document.getElementById('modalUsuario'))?.hide();
  }

  alterarFoto(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;

    const arquivo = input.files[0];
    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      const novaFoto = e.target?.result as string;

      this.usuarioEditando = {
        ...this.usuarioEditando,
        foto: novaFoto,
      };

      if (this.usuarioSelecionado) {
        this.usuarioSelecionado = {
          ...this.usuarioSelecionado,
          foto: novaFoto,
        };
      }

      this.cdr.detectChanges();
    };

    reader.readAsDataURL(arquivo);
  }
}
