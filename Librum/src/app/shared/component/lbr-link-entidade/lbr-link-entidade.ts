import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Permissao } from '../../../enum/permissoes.enum';
import { AuthService } from '../../../services/auth.service';

export type TipoEntidade = 'usuario' | 'material';

const DESTINOS: Record<TipoEntidade, { rota: string; permissao: Permissao; textoPadrao: string }> = {
  usuario: { rota: '/usuarios', permissao: Permissao.VER_USUARIOS, textoPadrao: 'Usuário' },
  material: { rota: '/materiais', permissao: Permissao.EDITAR_MATERIAL, textoPadrao: 'Material' },
};

/**
 * Nome de um usuário ou material que leva para a tela de detalhes dele.
 * Vira texto simples quando não há id ou quando a pessoa logada não pode abrir a tela.
 *
 * ```html
 * <lbr-link-entidade tipo="usuario" [id]="emprestimo.usuarioId" [texto]="emprestimo.usuarioNome" />
 * ```
 */
@Component({
  selector: 'lbr-link-entidade',
  imports: [RouterLink],
  template: `
    @if (rota(); as rota) {
      <a [routerLink]="rota" [attr.target]="novaAba() ? '_blank' : null" [attr.rel]="novaAba() ? 'noopener' : null"
        class="link-underline link-underline-opacity-0 link-underline-opacity-100-hover">{{ textoExibido() }}@if (novaAba()) {<i class="bi bi-box-arrow-up-right small ms-1" aria-hidden="true"></i><span class="visually-hidden"> (abre em nova aba)</span>}</a>
    } @else {
      <span>{{ textoExibido() }}</span>
    }
  `,
})
export class LbrLinkEntidade {
  readonly tipo = input.required<TipoEntidade>();
  readonly id = input<number | null | undefined>();
  readonly texto = input<string | null | undefined>();
  /** Use em fluxos que não podem ser interrompidos (ex.: no meio de um empréstimo). */
  readonly novaAba = input(false);

  private readonly authService = inject(AuthService);

  protected readonly textoExibido = computed(() => this.texto() || DESTINOS[this.tipo()].textoPadrao);

  protected readonly rota = computed(() => {
    const id = this.id();
    const destino = DESTINOS[this.tipo()];
    if (id == null || !this.authService.temPermissao(destino.permissao)) return null;
    return [destino.rota, id];
  });
}
