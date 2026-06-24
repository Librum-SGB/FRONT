import { Injectable, signal } from '@angular/core';
import { MensagemToast, TEMPO } from '../../enum/toast.enum';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private mensagem = signal<MensagemToast | null>(null);

  mensagemAtual = this.mensagem.asReadonly();

  sucesso(texto: string): void {
    this.mensagem.set({ texto, tipo: 'sucesso' });
    this.limparApos(TEMPO.TEMPO_MENSAGEM);
  }

  erro(texto: string): void {
    this.mensagem.set({ texto, tipo: 'erro' });
    this.limparApos(TEMPO.TEMPO_MENSAGEM);
  }

  aviso(texto: string): void {
    this.mensagem.set({ texto, tipo: 'aviso' });
    this.limparApos(TEMPO.TEMPO_MENSAGEM);
  }

  info(texto: string): void {
    this.mensagem.set({ texto, tipo: 'info' });
    this.limparApos(TEMPO.TEMPO_MENSAGEM);
  }

  private limparApos(ms: number): void {
    setTimeout(() => this.mensagem.set(null), ms);
  }
}
