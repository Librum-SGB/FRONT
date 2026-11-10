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
import { Badge } from '../../shared/component/badge/badge';
import { FormUtils } from '../../utils/FormUtil';
import { AlertaErros } from '../../shared/component/alerta-erros/alerta-erros';
import { UsuarioAtualizacao, UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
import { Permissao } from '../../enum/permissoes.enum';
import { Busca } from '../../shared/component/input-busca/busca.interface';

declare var bootstrap: any;

const ITENS_POR_PAGINA = 10;

@Component({
  selector: 'app-editar-excluir-usuario',
  imports: [
    FormsModule,
    CommonModule,
    RouterLink,
    CorpoPadrao,
    InputBusca,
    LbrButtom,
    Badge,
    ReactiveFormsModule,
    AlertaErros,
  ],
  templateUrl: './editar-excluir-usuario.html',
  styleUrl: './editar-excluir-usuario.scss',
})
export class EditarExcluirUsuario implements OnInit {
  filtro = 'TODOS';
  busca = '';

  usuarioSelecionado: Usuario | null = null;
  usuarioEditando: Usuario = {} as Usuario;
  usuarios: Usuario[] = [];
  carregando = true;
  salvando = false;
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

  get podeEditar(): boolean {
    return this.authService.temPermissao(Permissao.EDITAR_USUARIO);
  }

  get podeCriar(): boolean {
    return this.authService.temPermissao(Permissao.CRIAR_USUARIO);
  }

  get podeExcluir(): boolean {
    return this.authService.temPermissao(Permissao.EXCLUIR_USUARIO);
  }

  constructor(
    private cdr: ChangeDetectorRef,
    private toastService: ToastService,
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private authService: AuthService,
  ) {
    this.formUsuario = this.fb.group({
      id: [{ value: null, disabled: true }],
      nome: ['', [Validators.required, Validators.minLength(3)]],
      cpf: ['', FormUtils.cpf],
      email: ['', [Validators.required, Validators.email]],
      telefone: [''],
      endereco: [''],
      numero: [''],
      bairro: [''],
      cidade: [''],
      estado: ['', [Validators.minLength(2), Validators.maxLength(2)]],
      cep: ['', Validators.pattern(/^\d{5}-?\d{3}$/)],
      limiteLivros: [1, Validators.min(1)],
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
    this.filtro = busca.filtro;
    this.paginaAtual = 1;
  }

  usuariosFiltrados(): Usuario[] {
    return this.usuarios.filter((usuario) => {
      const valor = this.busca.toLowerCase();

      if (this.filtro === 'ID') return usuario.id?.toString().includes(valor) ?? false;
      if (this.filtro === 'NOME') return usuario.nome.toLowerCase().includes(valor);
      return usuario.nome.toLowerCase().includes(valor) || usuario.id?.toString().includes(valor) === true;
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
      numero: this.usuarioSelecionado.numero,
      bairro: this.usuarioSelecionado.bairro,
      cidade: this.usuarioSelecionado.cidade,
      estado: this.usuarioSelecionado.estado,
      cep: this.usuarioSelecionado.cep,
      limiteLivros: this.usuarioSelecionado.limiteLivros,
    });

    this.enviado = false;
    this.mensagensErro = [];

    this.trocarModal('modalUsuario', 'editarModal');
  }

  salvarEdicao(): void {
    if (!this.podeEditar || this.salvando) return;
    this.enviado = true;
    this.mensagensErro = FormUtils.gerarMensagensErro(this.formUsuario, this.nomesCampos);

    if (this.formUsuario.invalid) return; // o modal continua aberto, com o alerta

    // Sincroniza o nome exibido na confirmação antes de persistir.
    this.usuarioEditando = { ...this.usuarioEditando, ...this.formUsuario.getRawValue() };

    this.trocarModal('editarModal', 'confirmarEdicaoUsuarioModal');
  }

  cancelarConfirmacaoEdicao(): void {
    this.trocarModal('confirmarEdicaoUsuarioModal', 'editarModal');
  }

  confirmarEdicao(): void {
    const selecionado = this.usuarioSelecionado;
    const id = selecionado?.id;
    if (!this.podeEditar || !selecionado || id == null || this.salvando) return;

    const dados = this.formUsuario.getRawValue();
    const atualizacao: UsuarioAtualizacao = {
      nome: String(dados.nome).trim(),
      email: String(dados.email).trim().toLocaleLowerCase('pt-BR'),
      filialId: selecionado.filialId,
      cpf: dados.cpf ? String(dados.cpf).replace(/\D/g, '') : undefined,
      telefone: dados.telefone ? String(dados.telefone).replace(/\D/g, '') : undefined,
      dataNascimento: this.dataISO(selecionado.dataNascimento),
      endereco: String(dados.endereco ?? '').trim() || undefined,
      numero: String(dados.numero ?? '').trim() || undefined,
      bairro: String(dados.bairro ?? '').trim() || undefined,
      cidade: String(dados.cidade ?? '').trim() || undefined,
      estado: String(dados.estado ?? '').trim() || undefined,
      cep: dados.cep ? String(dados.cep).replace(/\D/g, '') : undefined,
      limiteLivros: dados.limiteLivros == null ? undefined : Number(dados.limiteLivros),
    };

    this.salvando = true;
    this.usuarioService.atualizar(id, atualizacao).subscribe({
      next: (usuarioAtualizado) => {
        const index = this.usuarios.findIndex((usuario) => usuario.id === id);
        if (index !== -1) this.usuarios[index] = usuarioAtualizado;
        this.usuarioSelecionado = usuarioAtualizado;
        this.usuarioEditando = { ...usuarioAtualizado };
        this.salvando = false;
        bootstrap.Modal.getInstance(document.getElementById('confirmarEdicaoUsuarioModal'))?.hide();
        this.toastService.sucesso('Usuário editado com sucesso!');
      },
      error: (error) => {
        this.salvando = false;
        this.toastService.erro(error.error?.message ?? 'Não foi possível editar o usuário.');
      },
    });
  }

  abrirModalExcluir(): void {
    this.trocarModal('modalUsuario', 'excluirModal');
  }

  cancelarExclusao(): void {
    this.trocarModal('excluirModal', 'modalUsuario');
  }

  confirmarExclusao(): void {
    const id = this.usuarioSelecionado?.id;
    if (!this.podeExcluir || id == null || this.salvando) return;

    this.salvando = true;
    this.usuarioService.excluir(id).subscribe({
      next: () => {
        this.usuarios = this.usuarios.filter((usuario) => usuario.id !== id);
        this.usuarioSelecionado = null;
        this.salvando = false;
        bootstrap.Modal.getInstance(document.getElementById('excluirModal'))?.hide();
        this.toastService.sucesso('Usuário excluído com sucesso!');
      },
      error: (error) => {
        this.salvando = false;
        this.toastService.erro(error.error?.message ?? 'Não foi possível excluir o usuário.');
      },
    });
  }

  private dataISO(data?: Date | string): string | undefined {
    if (!data) return undefined;
    if (typeof data === 'string') return data.slice(0, 10);
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }
}
