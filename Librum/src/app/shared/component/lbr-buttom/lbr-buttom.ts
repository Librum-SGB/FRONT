import { Component, computed, input } from '@angular/core';

export type ButtonVariant =
  | 'confirmar'
  | 'cadastrar'
  | 'concluir'
  | 'finalizar'
  | 'cancelar'
  | 'limpar'
  | 'cancela/limpa'
  | 'excluir'
  | 'editar'
  | 'renovar'
  | 'outros';

export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'button[lbrButton], a[lbrButton]',
  imports: [],
  templateUrl: './lbr-buttom.html',
  styleUrl: './lbr-buttom.scss',
  host: {
    '[class]': 'hostClasses()',
    '[attr.disabled]': 'disabled() || loading() ? true : null',
    '[attr.aria-disabled]': 'disabled() || loading()',
  },
})
export class LbrButtom {
  variant = input<ButtonVariant>('outros');
  size = input<ButtonSize>('md');
  loading = input<boolean>(false);
  disabled = input<boolean>(false);

  private variantClassMap: Record<string, string> = {
    confirmar: 'btn-success',
    cadastrar: 'btn-success',
    concluir: 'btn-success',
    finalizar: 'btn-success',
    cancelar: 'btn-outline-secondary',
    limpar: 'btn-outline-secondary',
    'cancela/limpa': 'btn-outline-secondary',
    excluir: 'btn-outline-danger',
    editar: 'btn-outline-warning',
    outros: 'btn-primary',
    renovar: 'btn-warning',
  };

  protected hostClasses = computed(() => {
    const base = 'btn d-inline-flex align-items-center justify-content-center gap-2';
    const variantClass = this.variantClassMap[this.variant()] || 'btn-primary';
    const sizeClass = this.size() !== 'md' ? `btn-${this.size()}` : '';

    return `${base} ${variantClass} ${sizeClass}`.trim();
  });
}
