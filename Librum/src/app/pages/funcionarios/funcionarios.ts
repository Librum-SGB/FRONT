import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FuncaoUsuario } from '../../enum/funcaoUsuario.enum';
import { Permissao } from '../../enum/permissoes.enum';
import { Usuario } from '../../models/usuario.model';
import { AcoesUsuarioService } from '../../services/acoes-usuario.service';
import { AuthService } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario.service';
import { Badge } from '../../shared/component/badge/badge';
import { CorpoPadrao } from '../../shared/component/corpo-padrao/corpo-padrao';
import { AcaoMenu, LbrAcoes } from '../../shared/component/lbr-acoes/lbr-acoes';
import { LbrButtom } from '../../shared/component/lbr-buttom/lbr-buttom';
import { LbrFiltros } from '../../shared/component/lbr-filtros/lbr-filtros';
import {
  ConfigFiltro,
  filtrarItens,
  temFiltroAtivo,
  ValoresFiltro,
} from '../../shared/component/lbr-filtros/filtros';
import { LbrLinkEntidade } from '../../shared/component/lbr-link-entidade/lbr-link-entidade';
import {
  LbrTabela,
  LbrTabelaCabecalho,
  LbrTabelaLinha,
  LbrTabelaOrdenar,
} from '../../shared/component/lbr-tabela/lbr-tabela';
import { ToastService } from '../../shared/services/toast.service';
import { corSituacaoUsuario, rotuloSituacaoUsuario, situacaoUsuario } from '../../utils/usuario.util';

export const ROTULOS_FUNCAO: Record<string, string> = {
  [FuncaoUsuario.ADMIN]: 'Administrador',
  [FuncaoUsuario.BIBLIOTECARIA]: 'Bibliotecária',
  [FuncaoUsuario.ASSISTENTE]: 'Assistente',
};

/** Listagem de funcionários (admin, bibliotecária e assistente), no mesmo padrão da de Usuários. */
@Component({
  selector: 'app-funcionarios',
  imports: [
    RouterLink,
    CorpoPadrao,
    LbrButtom,
    Badge,
    LbrAcoes,
    LbrFiltros,
    LbrLinkEntidade,
    LbrTabela,
    LbrTabelaCabecalho,
    LbrTabelaLinha,
    LbrTabelaOrdenar,
  ],
  templateUrl: './funcionarios.html',
})
export class Funcionarios implements OnInit {
  private readonly usuarioService = inject(UsuarioService);
  private readonly acoesUsuario = inject(AcoesUsuarioService);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);

  protected readonly temFiltroAtivo = temFiltroAtivo;
  protected readonly rotuloSituacao = rotuloSituacaoUsuario;
  protected readonly corSituacao = corSituacaoUsuario;
  protected readonly rotuloFuncao = (u: Usuario) => ROTULOS_FUNCAO[u.funcao ?? ''] ?? u.funcao ?? '—';

  private readonly funcionarios = signal<Usuario[]>([]);
  readonly carregando = signal(true);
  readonly filtros = signal<ValoresFiltro>({});
  private readonly processandoId = signal<number | null>(null);

  readonly configFiltro: ConfigFiltro<Usuario> = {
    placeholderBusca: 'Buscar por nome, ID, e-mail ou matrícula...',
    busca: (u) => [u.id, u.nome, u.email, u.matriculaFuncionario],
    campos: [
      {
        tipo: 'opcoes',
        chave: 'funcao',
        rotulo: 'Função',
        valorDoItem: (u) => u.funcao,
        opcoes: Object.entries(ROTULOS_FUNCAO).map(([valor, rotulo]) => ({ valor, rotulo })),
      },
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
    ],
  };

  readonly funcionariosFiltrados = computed(() =>
    filtrarItens(this.funcionarios(), this.configFiltro, this.filtros()),
  );

  /** Admin cadastra qualquer função; bibliotecária, só assistentes (a tela de cadastro limita). */
  get podeCadastrar(): boolean {
    return this.authService.temPermissao(Permissao.CRIAR_USUARIO);
  }

  ngOnInit(): void {
    this.usuarioService.listarFuncionarios().subscribe({
      next: (funcionarios) => {
        this.funcionarios.set([...funcionarios].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')));
        this.carregando.set(false);
      },
      error: (erro) => {
        this.carregando.set(false);
        this.toast.erro(erro.error?.message ?? 'Não foi possível carregar os funcionários.');
      },
    });
  }

  acoesDoFuncionario(funcionario: Usuario): AcaoMenu[] {
    // Bibliotecária só gerencia assistentes; admin gerencia todos.
    const podeGerenciar =
      !!funcionario.funcao && this.authService.podeGerenciarFuncao(funcionario.funcao as FuncaoUsuario);
    const podeEditar = podeGerenciar && this.authService.temPermissao(Permissao.EDITAR_USUARIO);
    const ocupado = this.processandoId() !== null;
    const inativo = funcionario.ativo === false;
    return [
      { rotulo: 'Ver detalhes', icone: 'bi-eye', rota: ['/usuarios', funcionario.id] },
      {
        rotulo: 'Editar',
        icone: 'bi-pencil',
        rota: ['/usuarios', funcionario.id, 'editar'],
        visivel: podeEditar,
      },
      {
        rotulo: funcionario.estaBloqueado ? 'Desbloquear' : 'Bloquear',
        icone: funcionario.estaBloqueado ? 'bi-unlock' : 'bi-lock',
        separadorAntes: true,
        visivel: podeEditar,
        desabilitado: ocupado,
        executar: () => void this.aplicar(funcionario, () => this.acoesUsuario.alternarBloqueio(funcionario)),
      },
      {
        rotulo: inativo ? 'Reativar' : 'Inativar',
        icone: inativo ? 'bi-person-check' : 'bi-person-dash',
        visivel: podeEditar,
        desabilitado: ocupado,
        executar: () => void this.aplicar(funcionario, () => this.acoesUsuario.alternarAtivacao(funcionario)),
      },
      {
        rotulo: 'Excluir',
        icone: 'bi-trash',
        perigo: true,
        separadorAntes: true,
        visivel: podeGerenciar && this.authService.temPermissao(Permissao.EXCLUIR_USUARIO),
        desabilitado: ocupado,
        executar: () => void this.excluir(funcionario),
      },
    ];
  }

  async excluir(funcionario: Usuario): Promise<void> {
    this.processandoId.set(funcionario.id ?? null);
    const excluido = await this.acoesUsuario.excluir(funcionario);
    this.processandoId.set(null);
    if (excluido) this.funcionarios.update((lista) => lista.filter((u) => u.id !== funcionario.id));
  }

  private async aplicar(funcionario: Usuario, acao: () => Promise<Usuario | null>): Promise<void> {
    this.processandoId.set(funcionario.id ?? null);
    const atualizado = await acao();
    this.processandoId.set(null);
    if (atualizado) {
      this.funcionarios.update((lista) => lista.map((u) => (u.id === atualizado.id ? atualizado : u)));
    }
  }
}
