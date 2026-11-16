import { DatePipe } from '@angular/common';
import { LbrTrilha } from '../../shared/component/lbr-trilha/lbr-trilha';
import { NavegacaoService } from '../../shared/services/navegacao.service';
import { LbrVoltar } from '../../shared/directives/lbr-voltar';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Permissao } from '../../enum/permissoes.enum';
import { Emprestimo, RenovacaoPrevia } from '../../models/emprestimo.model';
import { AuthService } from '../../services/auth.service';
import { EmprestimoService } from '../../services/emprestimo.service';
import { OperacoesEmprestimoService } from '../../services/operacoes-emprestimo.service';
import { Badge } from '../../shared/component/badge/badge';
import { CorpoPadrao } from '../../shared/component/corpo-padrao/corpo-padrao';
import { LbrButtom } from '../../shared/component/lbr-buttom/lbr-buttom';
import { LbrLinkEntidade } from '../../shared/component/lbr-link-entidade/lbr-link-entidade';
import {
  corSituacao,
  diasDeAtraso,
  estaEmAberto,
  rotuloSituacao,
} from '../../utils/emprestimo.util';
import { formatarDataBR } from '../../utils/data.util';

@Component({
  selector: 'app-detalhe-emprestimo',
  imports: [DatePipe, RouterLink, CorpoPadrao, LbrButtom, Badge, LbrLinkEntidade, LbrVoltar, LbrTrilha],
  templateUrl: './detalhe-emprestimo.html',
})
export class DetalheEmprestimo implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly emprestimoService = inject(EmprestimoService);
  private readonly operacoes = inject(OperacoesEmprestimoService);
  private readonly navegacao = inject(NavegacaoService);

  protected readonly formatarDataBR = formatarDataBR;

  readonly emprestimo = signal<Emprestimo | null>(null);
  readonly previa = signal<RenovacaoPrevia | null>(null);
  readonly carregando = signal(true);
  readonly erroCarregamento = signal('');
  readonly processando = signal(false);

  readonly situacao = computed(() => {
    const e = this.emprestimo();
    return e ? { rotulo: rotuloSituacao(e), cor: corSituacao(e) } : null;
  });

  readonly atraso = computed(() => {
    const e = this.emprestimo();
    return e ? diasDeAtraso(e) : 0;
  });

  readonly emAberto = computed(() => {
    const e = this.emprestimo();
    return !!e && estaEmAberto(e);
  });

  get podeGerenciar(): boolean {
    return this.authService.temPermissao(Permissao.GERENCIAR_EMPRESTIMOS);
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      this.erroCarregamento.set('Empréstimo não encontrado.');
      this.carregando.set(false);
      return;
    }

    this.emprestimoService.buscarPorId(id).subscribe({
      next: (emprestimo) => {
        this.emprestimo.set(emprestimo);
        this.navegacao.definirTitulo(`Empréstimo #${emprestimo.id}`);
        this.carregando.set(false);
        this.carregarPrevia();
      },
      error: (err: HttpErrorResponse) => {
        this.erroCarregamento.set(
          err.status === 404
            ? 'Empréstimo não encontrado.'
            : (err.error?.message ?? 'Não foi possível carregar o empréstimo.'),
        );
        this.carregando.set(false);
      },
    });
  }

  /** Informação de renovação no cartão lateral (só para quem pode renovar). */
  private carregarPrevia(): void {
    const e = this.emprestimo();
    this.previa.set(null);
    if (!e?.id || !estaEmAberto(e) || !this.podeGerenciar) return;
    this.emprestimoService.previaRenovacao(e.id).subscribe({
      next: (previa) => this.previa.set(previa),
      error: (err) => console.error('Erro ao consultar renovação:', err),
    });
  }

  async renovar(): Promise<void> {
    const e = this.emprestimo();
    if (!e || this.processando()) return;
    this.processando.set(true);
    const atualizado = await this.operacoes.renovar(e);
    this.processando.set(false);
    if (atualizado) {
      this.emprestimo.set(atualizado);
      this.carregarPrevia();
    }
  }

  async devolver(): Promise<void> {
    const e = this.emprestimo();
    if (!e || this.processando()) return;
    this.processando.set(true);
    const atualizado = await this.operacoes.devolver(e);
    this.processando.set(false);
    if (atualizado) {
      this.emprestimo.set(atualizado);
      this.previa.set(null);
    }
  }
}
