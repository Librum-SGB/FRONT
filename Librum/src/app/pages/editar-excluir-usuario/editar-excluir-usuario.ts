import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
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
import { UsuarioService } from '../../services/usuario.service';

declare var bootstrap: any;

const ITENS_POR_PAGINA = 20;

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
export class EditarExcluirUsuario implements OnInit {
  filtro = 'nome';
  busca = '';

  usuarioSelecionado: Usuario | null = null;
  usuarioEditando: Usuario = {} as Usuario;
  usuarios: Usuario[] = [];
  carregando = true;
  paginaAtual = 1;

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
    private usuarioService: UsuarioService,
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

  ngOnInit(): void {
    this.usuarioService.listarAlunos().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.carregando = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.carregando = false;
        this.cdr.markForCheck();
        this.toastService.erro(error.error?.message ?? 'Não foi possível carregar os usuários.');
      },
    });
  }

  isInvalido(campo: string): boolean {
    return FormUtils.isInvalido(this.formUsuario, campo, this.enviado);
  }

  pesquisarUsuario(busca: Busca): void {
    this.busca = busca.texto.trim();
    this.filtro = busca.filtro === 'ID' ? 'id' : 'nome';
    this.paginaAtual = 1;
  }

  usuariosFiltrados(): Usuario[] {
    return this.usuarios.filter((usuario) => {
      const valor = this.busca.toLowerCase();

      return this.filtro === 'nome'
        ? usuario.nome.toLowerCase().includes(valor)
        : usuario.id?.toString().includes(valor);
    });
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.usuariosFiltrados().length / ITENS_POR_PAGINA));
  }

  get paginaEfetiva(): number {
    return Math.min(this.paginaAtual, this.totalPaginas);
  }

  get usuariosPagina(): Usuario[] {
    const inicio = (this.paginaEfetiva - 1) * ITENS_POR_PAGINA;
    return this.usuariosFiltrados().slice(inicio, inicio + ITENS_POR_PAGINA);
  }

  get inicioExibicao(): number {
    return this.usuariosFiltrados().length === 0 ? 0 : (this.paginaEfetiva - 1) * ITENS_POR_PAGINA + 1;
  }

  get fimExibicao(): number {
    return Math.min(this.paginaEfetiva * ITENS_POR_PAGINA, this.usuariosFiltrados().length);
  }

  get paginasVisiveis(): number[] {
    const total = this.totalPaginas;
    const atual = this.paginaEfetiva;
    const janela = 5;
    let inicio = Math.max(1, atual - Math.floor(janela / 2));
    const fim = Math.min(total, inicio + janela - 1);
    inicio = Math.max(1, fim - janela + 1);
    return Array.from({ length: fim - inicio + 1 }, (_, index) => inicio + index);
  }

  irParaPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaAtual = pagina;
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
