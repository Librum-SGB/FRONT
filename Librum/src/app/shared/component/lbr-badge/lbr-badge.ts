import { Component, input } from '@angular/core';

export type LbrBadgeVariant = 'livro' | 'periodico' | 'outros' | 'disponivel' | 'indisponivel';

@Component({
  selector: 'lbr-badge',
  templateUrl: './lbr-badge.html',
  styleUrl: './lbr-badge.scss',
})
export class LbrBadge {
  variant = input.required<LbrBadgeVariant>();
}