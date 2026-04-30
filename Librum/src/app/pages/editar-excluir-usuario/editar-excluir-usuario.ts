import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-editar-excluir-usuario',
  imports: [FormsModule, CommonModule],
  templateUrl: './editar-excluir-usuario.html',
  styleUrl: './editar-excluir-usuario.scss',
})
export class EditarExcluirUsuario {

  filtro = 'nome';
  busca = '';

  usuarioSelecionado: any = null;

  usuarios = [
    {
      id: 'USR-00001',
      nome: 'João Pedro Silva',
      cpf: '123.456.789-00',
      email: 'joao@email.com',
      telefone: '(11) 99999-9999',
      endereco: 'Rua A, 100',
      dataNascimento: '10/05/2000',
      dataCadastro: '24/04/2026',
      tipoCliente: 'Estudante',
      status: 'Ativo'
    },
    {
      id: 'USR-00002',
      nome: 'Maria Eduarda Santos',
      cpf: '987.654.321-00',
      email: 'maria@email.com',
      telefone: '(11) 98888-8888',
      endereco: 'Av Paulista, 1000',
      dataNascimento: '22/07/1998',
      dataCadastro: '15/02/2025',
      tipoCliente: 'Estudante',
      status: 'Ativo'
    },
    {
      id: 'USR-00003',
      nome: 'Carlos Alberto Souza',
      cpf: '111.222.333-44',
      email: 'carlos@email.com',
      telefone: '(11) 97777-7777',
      endereco: 'Rua B, 200',
      dataNascimento: '01/03/1995',
      dataCadastro: '10/01/2024',
      tipoCliente: 'Professor',
      status: 'Ativo'
    },
    {
      id: 'USR-00004',
      nome: 'Ana Julia Costa',
      cpf: '555.666.777-88',
      email: 'ana@email.com',
      telefone: '(11) 96666-6666',
      endereco: 'Rua C, 300',
      dataNascimento: '18/11/2002',
      dataCadastro: '02/01/2023',
      tipoCliente: 'Outro',
      status: 'Inativo'
    }
  ];

  usuariosFiltrados() {
    return this.usuarios.filter(usuario => {
      const valor = this.busca.toLowerCase();

      if (this.filtro === 'nome') {
        return usuario.nome.toLowerCase().includes(valor);
      }

      return usuario.id.toLowerCase().includes(valor);
    });
  }

  selecionarUsuario(usuario: any) {
    this.usuarioSelecionado = usuario;
  }

  editarUsuario() {
    alert('Editar usuário');
  }

  excluirUsuario() {
    const confirmar = confirm('Deseja excluir este usuário?');

    if (confirmar) {
      this.usuarios = this.usuarios.filter(
        u => u.id !== this.usuarioSelecionado.id
      );
      alert('Usuário excluído com sucesso');
    }
  }
}
