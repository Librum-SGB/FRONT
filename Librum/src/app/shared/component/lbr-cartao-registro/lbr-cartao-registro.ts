import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';

/**
 * Cartão "Registro" das telas de detalhe: quando foi cadastrado e atualizado.
 * Outras linhas (ex.: "Último acesso") podem ser colocadas dentro, como pares `<dt>`/`<dd>`.
 */
@Component({
  selector: 'lbr-cartao-registro',
  imports: [DatePipe],
  template: `
    <section class="card">
      <div class="card-body p-4">
        <h3 class="h6 text-uppercase text-secondary mb-3">Registro</h3>
        <dl class="mb-0">
          <dt class="fw-semibold">Cadastrado em</dt>
          <dd>{{ (criadoEm() | date: 'dd/MM/yyyy HH:mm') || '—' }}</dd>
          <dt class="fw-semibold">Última atualização</dt>
          <dd class="mb-0">{{ (atualizadoEm() | date: 'dd/MM/yyyy HH:mm') || '—' }}</dd>
          <ng-content />
        </dl>
      </div>
    </section>
  `,
})
export class LbrCartaoRegistro {
  readonly criadoEm = input<Date | string | null | undefined>();
  readonly atualizadoEm = input<Date | string | null | undefined>();
}
