import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';

import { Usuario } from '../models/usuario.model';
import { AcaoMenu } from '../shared/component/lbr-acoes/lbr-acoes';
import { ConfirmacaoService, DetalheConfirmacao, PedidoConfirmacao } from '../shared/services/confirmacao.service';
import { ToastService } from '../shared/services/toast.service';
import { mensagemDeErro } from '../utils/http.util';
import { ROTAS } from '../utils/rotas';
import { rotuloSituacaoUsuario } from '../utils/usuario.util';
import { UsuarioService } from './usuario.service';

export interface OpcoesMenuUsuario {
  /** Lista da tela: é atualizada com a resposta do backend depois de cada ação. */
  lista: WritableSignal<Usuario[]>;
  /** Pode editar, bloquear e inativar esta conta. */
  podeGerenciar: boolean;
  podeExcluir: boolean;
  /** Mostra "Ver histórico" (leitores). */
  verHistorico?: boolean;
}

/**
 * Ações sobre contas (leitores e funcionários): o menu ⋮ das listagens e as operações
 * de bloquear, inativar e excluir, sempre com confirmação e aviso do resultado.
 */
@Injectable({ providedIn: 'root' })
export class AcoesUsuarioService {
  private readonly usuarioService = inject(UsuarioService);
  private readonly confirmacao = inject(ConfirmacaoService);
  private readonly toast = inject(ToastService);

  /** Conta com uma ação em andamento (evita cliques repetidos). */
  private readonly processandoId = signal<number | null>(null);

  menu(usuario: Usuario, opcoes: OpcoesMenuUsuario): AcaoMenu[] {
    const ocupado = this.processandoId() !== null;
    const inativo = usuario.ativo === false;
    return [
      { rotulo: 'Ver detalhes', icone: 'bi-eye', rota: ['/usuarios', usuario.id] },
      {
        rotulo: 'Ver histórico',
        icone: 'bi-clock-history',
        rota: ROTAS.historico,
        queryParams: { usuario: usuario.id },
        visivel: !!opcoes.verHistorico,
      },
      {
        rotulo: 'Editar',
        icone: 'bi-pencil',
        rota: ['/usuarios', usuario.id, 'editar'],
        visivel: opcoes.podeGerenciar,
      },
      {
        rotulo: usuario.estaBloqueado ? 'Desbloquear' : 'Bloquear',
        icone: usuario.estaBloqueado ? 'bi-unlock' : 'bi-lock',
        separadorAntes: true,
        visivel: opcoes.podeGerenciar,
        desabilitado: ocupado,
        executar: () => void this.atualizarNaLista(usuario, opcoes.lista, () => this.alternarBloqueio(usuario)),
      },
      {
        rotulo: inativo ? 'Reativar' : 'Inativar',
        icone: inativo ? 'bi-person-check' : 'bi-person-dash',
        visivel: opcoes.podeGerenciar,
        desabilitado: ocupado,
        executar: () => void this.atualizarNaLista(usuario, opcoes.lista, () => this.alternarAtivacao(usuario)),
      },
      {
        rotulo: 'Excluir',
        icone: 'bi-trash',
        perigo: true,
        separadorAntes: true,
        visivel: opcoes.podeExcluir,
        desabilitado: ocupado,
        executar: () => void this.excluirDaLista(usuario, opcoes.lista),
      },
    ];
  }

  alternarBloqueio(usuario: Usuario): Promise<Usuario | null> {
    const bloquear = !usuario.estaBloqueado;
    return this.executar(
      bloquear
        ? {
            titulo: 'Bloquear usuário',
            icone: 'bi-lock',
            tom: 'warning',
            mensagem: 'Enquanto estiver bloqueado, não pode fazer novos empréstimos nem renovações.',
            detalhes: this.identificacao(usuario),
            textoConfirmar: 'Bloquear',
          }
        : {
            titulo: 'Desbloquear usuário',
            icone: 'bi-unlock',
            tom: 'success',
            mensagem: 'Volta a poder fazer empréstimos e renovações.',
            detalhes: this.identificacao(usuario),
            textoConfirmar: 'Desbloquear',
          },
      () => this.usuarioService.atualizarBloqueio(usuario.id!, bloquear),
      bloquear ? `${usuario.nome} foi bloqueado.` : `${usuario.nome} foi desbloqueado.`,
    );
  }

  alternarAtivacao(usuario: Usuario): Promise<Usuario | null> {
    const inativar = usuario.ativo !== false;
    return this.executar(
      inativar
        ? {
            titulo: 'Inativar usuário',
            icone: 'bi-person-dash',
            tom: 'secondary',
            mensagem: 'A conta deixa de entrar no sistema e não aparece para novos empréstimos.',
            detalhes: this.identificacao(usuario),
            aviso: 'Dá para reativar depois, pelo filtro Status → Inativo.',
            textoConfirmar: 'Inativar',
          }
        : {
            titulo: 'Reativar usuário',
            icone: 'bi-person-check',
            tom: 'success',
            mensagem: 'A conta volta a entrar no sistema.',
            detalhes: this.identificacao(usuario),
            textoConfirmar: 'Reativar',
          },
      () => this.usuarioService.atualizarAtivacao(usuario.id!, !inativar),
      inativar ? `${usuario.nome} foi inativado.` : `${usuario.nome} foi reativado.`,
    );
  }

  async excluir(usuario: Usuario): Promise<boolean> {
    if (usuario.id == null) return false;
    const confirmado = await this.confirmacao.confirmar({
      titulo: 'Excluir usuário',
      icone: 'bi-trash',
      tom: 'danger',
      detalhes: this.identificacao(usuario),
      aviso: 'Esta ação não pode ser desfeita. Para apenas impedir o acesso, prefira inativar.',
      textoConfirmar: 'Excluir',
    });
    if (!confirmado) return false;

    try {
      await firstValueFrom(this.usuarioService.excluir(usuario.id));
      this.toast.sucesso(`${usuario.nome} foi excluído.`);
      return true;
    } catch (erro) {
      this.toast.erro(mensagemDeErro(erro, 'Não foi possível excluir o usuário.'));
      return false;
    }
  }

  private identificacao(usuario: Usuario): DetalheConfirmacao[] {
    return [
      { rotulo: 'Nome', valor: usuario.nome, destaque: true },
      { rotulo: 'E-mail', valor: usuario.email || '—' },
      { rotulo: 'Situação atual', valor: rotuloSituacaoUsuario(usuario) },
    ];
  }

  private async executar(
    pedido: PedidoConfirmacao,
    acao: () => Observable<Usuario>,
    mensagemSucesso: string,
  ): Promise<Usuario | null> {
    if (!(await this.confirmacao.confirmar(pedido))) return null;
    try {
      const atualizado = await firstValueFrom(acao());
      this.toast.sucesso(mensagemSucesso);
      return atualizado;
    } catch (erro) {
      this.toast.erro(mensagemDeErro(erro, 'Não foi possível concluir a ação.'));
      return null;
    }
  }

  /** Executa a ação travando o menu e troca a linha da lista pela resposta do backend. */
  private async atualizarNaLista(
    usuario: Usuario,
    lista: WritableSignal<Usuario[]>,
    acao: () => Promise<Usuario | null>,
  ): Promise<void> {
    this.processandoId.set(usuario.id ?? null);
    const atualizado = await acao();
    this.processandoId.set(null);
    if (atualizado) lista.update((itens) => itens.map((u) => (u.id === atualizado.id ? atualizado : u)));
  }

  private async excluirDaLista(usuario: Usuario, lista: WritableSignal<Usuario[]>): Promise<void> {
    this.processandoId.set(usuario.id ?? null);
    const excluido = await this.excluir(usuario);
    this.processandoId.set(null);
    if (excluido) lista.update((itens) => itens.filter((u) => u.id !== usuario.id));
  }
}
