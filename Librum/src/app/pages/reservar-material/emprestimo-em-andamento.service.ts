import { computed, Injectable, signal } from '@angular/core';

import { ExemplarResponse } from '../../models/exemplar.model';
import { MaterialResponse } from '../../models/material.model';
import { Usuario } from '../../models/usuario.model';
import { dataDaquiA } from '../../utils/data.util';

export const PRAZO_PADRAO_DIAS = 14;
const LIMITE_PADRAO = 3;

export type EtapaEmprestimo = 1 | 2 | 3;

export interface MaterialParaEmprestimo {
  material: MaterialResponse;
  autor: string;
  exemplaresDisponiveis: ExemplarResponse[];
}

export interface ItemEmprestimo {
  material: MaterialParaEmprestimo;
  exemplarId: number;
}

/**
 * Empréstimo que está sendo montado na tela "Realizar Empréstimo".
 * Fica fora do componente para não se perder quando a pessoa abre o detalhe de um material
 * ou leitor e depois volta.
 */
@Injectable({ providedIn: 'root' })
export class EmprestimoEmAndamentoService {
  readonly etapa = signal<EtapaEmprestimo>(1);
  readonly usuario = signal<Usuario | null>(null);
  /** Empréstimos que o leitor já tem em aberto (ativos ou atrasados). */
  readonly emprestimosAbertos = signal(0);
  readonly itens = signal<ItemEmprestimo[]>([]);
  readonly dataDevolucao = signal(dataDaquiA(PRAZO_PADRAO_DIAS));

  readonly limite = computed(() => this.usuario()?.limiteLivros ?? LIMITE_PADRAO);

  /** Quantos materiais ainda cabem neste empréstimo. */
  readonly vagasRestantes = computed(() =>
    Math.max(0, this.limite() - this.emprestimosAbertos() - this.itens().length),
  );

  readonly limiteExcedido = computed(
    () => this.emprestimosAbertos() + this.itens().length > this.limite(),
  );

  limpar(): void {
    this.etapa.set(1);
    this.usuario.set(null);
    this.emprestimosAbertos.set(0);
    this.itens.set([]);
    this.dataDevolucao.set(dataDaquiA(PRAZO_PADRAO_DIAS));
  }
}
