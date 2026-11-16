import { Injectable, signal } from '@angular/core';

export type TomConfirmacao = 'primary' | 'success' | 'warning' | 'danger' | 'secondary';

export interface DetalheConfirmacao {
  rotulo: string;
  valor: string;
  /** Realça a informação principal (ex.: a nova data de devolução). */
  destaque?: boolean;
}

export interface PedidoConfirmacao {
  titulo: string;
  mensagem?: string;
  /** Classe do Bootstrap Icons, ex.: `bi-arrow-repeat`. */
  icone?: string;
  tom?: TomConfirmacao;
  detalhes?: DetalheConfirmacao[];
  /** Observação em destaque, ex.: "Esta ação não pode ser desfeita." */
  aviso?: string;
  textoConfirmar?: string;
  textoCancelar?: string;
}

interface PedidoPendente extends PedidoConfirmacao {
  responder: (confirmado: boolean) => void;
}

/**
 * Pede a confirmação de uma ação no modal padrão, com as informações principais e os botões
 * Cancelar/Confirmar. Exibido pelo componente `lbr-confirmacao` (em app.html).
 *
 * ```ts
 * if (await this.confirmacao.confirmar({ titulo: 'Excluir material', tom: 'danger', ... })) { ... }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class ConfirmacaoService {
  private readonly pedido = signal<PedidoPendente | null>(null);
  readonly pedidoAtual = this.pedido.asReadonly();

  confirmar(pedido: PedidoConfirmacao): Promise<boolean> {
    // Um novo pedido substitui o anterior, que é tratado como cancelado.
    this.pedido()?.responder(false);
    return new Promise((resolve) => this.pedido.set({ ...pedido, responder: resolve }));
  }

  responder(confirmado: boolean): void {
    const atual = this.pedido();
    this.pedido.set(null);
    atual?.responder(confirmado);
  }
}
