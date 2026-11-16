import { Injectable, signal } from '@angular/core';
import { MensagemToast, TEMPO } from '../../enum/toast.enum';

/** Notificações rápidas (sucesso, erro, aviso, info), exibidas pelo componente `app-toast`. */
@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private mensagem = signal<MensagemToast | null>(null);
  private temporizador?: ReturnType<typeof setTimeout>;

  mensagemAtual = this.mensagem.asReadonly();

  sucesso(texto: string): void {
    this.mostrar({ texto, tipo: 'sucesso' });
  }

  erro(texto: string): void {
    this.mostrar({ texto, tipo: 'erro' });
  }

  aviso(texto: string): void {
    this.mostrar({ texto, tipo: 'aviso' });
  }

  info(texto: string): void {
    this.mostrar({ texto, tipo: 'info' });
  }

  fechar(): void {
    clearTimeout(this.temporizador);
    this.mensagem.set(null);
  }

  private mostrar(mensagem: MensagemToast): void {
    // Uma mensagem nova reinicia o tempo (o timer da anterior não pode apagá-la antes da hora).
    clearTimeout(this.temporizador);
    this.mensagem.set(mensagem);
    this.temporizador = setTimeout(() => this.mensagem.set(null), TEMPO.TEMPO_MENSAGEM);
  }
}
