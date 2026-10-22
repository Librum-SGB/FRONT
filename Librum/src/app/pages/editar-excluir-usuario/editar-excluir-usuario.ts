import { Component, ChangeDetectorRef } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../models/usuario.model';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../shared/services/toast.service';
import { CorpoPadrao } from '../../shared/component/corpo-padrao/corpo-padrao';
import { InputBusca } from '../../shared/component/input-busca/input-busca';
import { LbrButtom } from '../../shared/component/lbr-buttom/lbr-buttom';
import { FormUtils } from '../../utils/FormUtil';
import { AlertaErros } from '../../shared/component/alerta-erros/alerta-erros';

declare var bootstrap: any;

@Component({
  selector: 'app-editar-excluir-usuario',
  imports: [
    FormsModule,
    CommonModule,
    RouterLink,
    CorpoPadrao,
    InputBusca,
    LbrButtom,
    ReactiveFormsModule,
    AlertaErros,
  ],
  templateUrl: './editar-excluir-usuario.html',
  styleUrl: './editar-excluir-usuario.scss',
})
export class EditarExcluirUsuario {
  filtro = 'nome';
  busca = '';

  usuarioSelecionado: Usuario | null = null;
  usuarioEditando: Usuario = {} as Usuario;

  formUsuario: FormGroup;
  enviado = false;
  mensagensErro: string[] = [];

  private readonly nomesCampos: Record<string, string> = {
    nome: 'Nome',
    cpf: 'CPF',
    email: 'E-mail',
    telefone: 'Telefone',
    endereco: 'Endereço',
    bairro: 'Bairro',
    cidade: 'Cidade',
    estado: 'Estado',
    cep: 'CEP',
    limiteLivros: 'Limite de Livros',
  };

  constructor(
    private cdr: ChangeDetectorRef,
    private toastService: ToastService,
    private fb: FormBuilder,
  ) {
    this.formUsuario = this.fb.group({
      id: [{ value: null, disabled: true }],
      nome: ['', [Validators.required, Validators.minLength(3)]],
      cpf: ['', [Validators.required, FormUtils.cpf]],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', Validators.required],
      endereco: ['', Validators.required],
      bairro: ['', Validators.required],
      cidade: ['', Validators.required],
      estado: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
      cep: ['', [Validators.required, Validators.pattern(/^\d{5}-?\d{3}$/)]],
      limiteLivros: [1, [Validators.required, Validators.min(1)]],
      estaBloqueado: [false],
    });
  }

  isInvalido(campo: string): boolean {
    return FormUtils.isInvalido(this.formUsuario, campo, this.enviado);
  }

  pesquisarUsuario(busca: Busca): void {
    console.log(busca);
  }

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

  editarUsuario(): void {
    if (!this.usuarioSelecionado) return;

    this.usuarioEditando = { ...this.usuarioSelecionado };

    this.formUsuario.reset({
      id: this.usuarioSelecionado.id,
      nome: this.usuarioSelecionado.nome,
      cpf: this.usuarioSelecionado.cpf,
      email: this.usuarioSelecionado.email,
      telefone: this.usuarioSelecionado.telefone,
      endereco: this.usuarioSelecionado.endereco,
      bairro: this.usuarioSelecionado.bairro,
      cidade: this.usuarioSelecionado.cidade,
      estado: this.usuarioSelecionado.estado,
      cep: this.usuarioSelecionado.cep,
      limiteLivros: this.usuarioSelecionado.limiteLivros,
      estaBloqueado: this.usuarioSelecionado.estaBloqueado,
    });

    this.enviado = false;
    this.mensagensErro = [];

    this.trocarModal('modalUsuario', 'editarModal');
  }

  salvarEdicao(): void {
    this.enviado = true;
    this.mensagensErro = FormUtils.gerarMensagensErro(this.formUsuario, this.nomesCampos);

    if (this.formUsuario.invalid) return; // o modal continua aberto, com o alerta

    // sincroniza para o modal de confirmação mostrar o nome novo
    this.usuarioEditando = { ...this.usuarioEditando, ...this.formUsuario.getRawValue() };

    this.trocarModal('editarModal', 'confirmarEdicaoUsuarioModal');
  }

  cancelarConfirmacaoEdicao(): void {
    this.trocarModal('confirmarEdicaoUsuarioModal', 'editarModal');
  }

  confirmarEdicao(): void {
    const index = this.usuarios.findIndex((usuario) => usuario.id === this.usuarioEditando.id);

    if (index !== -1) {
      this.usuarioEditando.dataUltimaAtualizacao = new Date();

      this.usuarios[index] = { ...this.usuarioEditando };
      this.usuarioSelecionado = { ...this.usuarioEditando };

      this.toastService.sucesso('Usuário editado com sucesso!');
    }

    bootstrap.Modal.getInstance(document.getElementById('confirmarEdicaoUsuarioModal'))?.hide();
  }

  abrirModalExcluir(): void {
    this.trocarModal('modalUsuario', 'excluirModal');
  }

  cancelarExclusao(): void {
    this.trocarModal('excluirModal', 'modalUsuario');
  }

  confirmarExclusao(): void {
    if (!this.usuarioSelecionado) return;

    this.usuarios = this.usuarios.filter((usuario) => usuario.id !== this.usuarioSelecionado?.id);

    this.toastService.sucesso('Usuário excluído com sucesso!');
    this.usuarioSelecionado = null;

    bootstrap.Modal.getInstance(document.getElementById('excluirModal'))?.hide();
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
