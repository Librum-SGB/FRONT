import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Usuario } from '../../models/usuario.model';
import { ToastService } from '../../shared/services/toast.service';
import { AcoesUsuarioService } from '../../services/acoes-usuario.service';
import { CorpoPadrao } from '../../shared/component/corpo-padrao/corpo-padrao';
import { LbrLinkEntidade } from '../../shared/component/lbr-link-entidade/lbr-link-entidade';
import { LbrButtom } from '../../shared/component/lbr-buttom/lbr-buttom';
import { Badge } from '../../shared/component/badge/badge';
import { AcaoMenu, LbrAcoes } from '../../shared/component/lbr-acoes/lbr-acoes';
import { LbrFiltros } from '../../shared/component/lbr-filtros/lbr-filtros';
import {
  ConfigFiltro,
  filtrarItens,
  opcoesDosItens,
  temFiltroAtivo,
  ValoresFiltro,
} from '../../shared/component/lbr-filtros/filtros';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
import { Permissao } from '../../enum/permissoes.enum';
import {
  LbrTabela,
  LbrTabelaCabecalho,
  LbrTabelaLinha,
  LbrTabelaOrdenar,
} from '../../shared/component/lbr-tabela/lbr-tabela';
import {
  corSituacaoUsuario,
  rotuloSituacaoUsuario,
  situacaoUsuario,
} from '../../utils/usuario.util';

@Component({
  selector: 'app-editar-excluir-usuario',
  imports: [
    RouterLink,
    CorpoPadrao,
    LbrLinkEntidade,
    LbrButtom,
    Badge,
    LbrAcoes,
    LbrFiltros,
    LbrTabela,
    LbrTabelaCabecalho,
    LbrTabelaLinha,
    LbrTabelaOrdenar,
  ],
  templateUrl: './editar-excluir-usuario.html',
  styleUrl: './editar-excluir-usuario.scss',
})
export class EditarExcluirUsuario implements OnInit {
  protected readonly temFiltroAtivo = temFiltroAtivo;
  protected readonly rotuloSituacao = rotuloSituacaoUsuario;
  protected readonly corSituacao = corSituacaoUsuario;

  private readonly toastService = inject(ToastService);
  private readonly acoesUsuario = inject(AcoesUsuarioService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly authService = inject(AuthService);

  private readonly usuarios = signal<Usuario[]>([]);
  readonly carregando = signal(true);
  readonly filtros = signal<ValoresFiltro>({});
  /** Usuário com uma ação em andamento (evita cliques repetidos). */
  private readonly processandoId = signal<number | null>(null);

  readonly configFiltro = computed<ConfigFiltro<Usuario>>(() => ({
    placeholderBusca: 'Buscar por nome, ID, e-mail, CPF ou telefone...',
    busca: (u) => [u.id, u.nome, u.email, u.cpf, u.telefone],
    campos: [
      {
        tipo: 'opcoes',
        chave: 'status',
        rotulo: 'Status',
        valorDoItem: (u) => situacaoUsuario(u),
        opcoes: [
          { valor: 'ATIVO', rotulo: 'Ativo' },
          { valor: 'BLOQUEADO', rotulo: 'Bloqueado' },
          { valor: 'INATIVO', rotulo: 'Inativo' },
        ],
      },
      {
        tipo: 'lista',
        chave: 'cidade',
        rotulo: 'Cidade',
        valorDoItem: (u) => u.cidade,
        opcoes: opcoesDosItens(this.usuarios(), (u) => u.cidade),
      },
    ],
  }));

  readonly usuariosFiltrados = computed(() =>
    filtrarItens(this.usuarios(), this.configFiltro(), this.filtros()),
  );

  get podeCriar(): boolean {
    return this.authService.temPermissao(Permissao.CRIAR_USUARIO);
  }

  ngOnInit(): void {
    // Inclui inativos para que possam ser encontrados (filtro Status) e reativados.
    this.usuarioService.listarAlunos(true).subscribe({
      next: (usuarios) => {
        this.usuarios.set(usuarios);
        this.carregando.set(false);
      },
      error: (error) => {
        this.carregando.set(false);
        this.toastService.erro(error.error?.message ?? 'Não foi possível carregar os usuários.');
      },
    });
  }

  acoesDoUsuario(usuario: Usuario): AcaoMenu[] {
    const podeEditar = this.authService.temPermissao(Permissao.EDITAR_USUARIO);
    const ocupado = this.processandoId() !== null;
    const inativo = usuario.ativo === false;
    return [
      { rotulo: 'Ver detalhes', icone: 'bi-eye', rota: ['/usuarios', usuario.id] },
      {
        rotulo: 'Ver histórico',
        icone: 'bi-clock-history',
        rota: '/historicoEmprestimo',
        queryParams: { usuario: usuario.id },
      },
      {
        rotulo: 'Editar',
        icone: 'bi-pencil',
        rota: ['/usuarios', usuario.id, 'editar'],
        visivel: podeEditar,
      },
      {
        rotulo: usuario.estaBloqueado ? 'Desbloquear' : 'Bloquear',
        icone: usuario.estaBloqueado ? 'bi-unlock' : 'bi-lock',
        separadorAntes: true,
        visivel: podeEditar,
        desabilitado: ocupado,
        executar: () => void this.alternarBloqueio(usuario),
      },
      {
        rotulo: inativo ? 'Reativar' : 'Inativar',
        icone: inativo ? 'bi-person-check' : 'bi-person-dash',
        visivel: podeEditar,
        desabilitado: ocupado,
        executar: () => void this.alternarAtivacao(usuario),
      },
      {
        rotulo: 'Excluir',
        icone: 'bi-trash',
        perigo: true,
        separadorAntes: true,
        visivel: this.authService.temPermissao(Permissao.EXCLUIR_USUARIO),
        desabilitado: ocupado,
        executar: () => void this.excluir(usuario),
      },
    ];
  }

  async alternarBloqueio(usuario: Usuario): Promise<void> {
    await this.aplicar(usuario, () => this.acoesUsuario.alternarBloqueio(usuario));
  }

  async alternarAtivacao(usuario: Usuario): Promise<void> {
    await this.aplicar(usuario, () => this.acoesUsuario.alternarAtivacao(usuario));
  }

  async excluir(usuario: Usuario): Promise<void> {
    this.processandoId.set(usuario.id ?? null);
    const excluido = await this.acoesUsuario.excluir(usuario);
    this.processandoId.set(null);
    if (excluido) this.usuarios.update((lista) => lista.filter((u) => u.id !== usuario.id));
  }

  /** Executa a ação (com confirmação) e atualiza a linha da tabela com a resposta do backend. */
  private async aplicar(usuario: Usuario, acao: () => Promise<Usuario | null>): Promise<void> {
    this.processandoId.set(usuario.id ?? null);
    const atualizado = await acao();
    this.processandoId.set(null);
    if (atualizado) {
      this.usuarios.update((lista) => lista.map((u) => (u.id === atualizado.id ? atualizado : u)));
    }
  }
}
