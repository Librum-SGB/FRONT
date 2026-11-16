import { Component, computed, inject } from '@angular/core';

import { TEMPO } from '../../../enum/toast.enum';
import { ToastService } from '../../services/toast.service';

const VISUAL_DA_MENSAGEM: Record<string, { cor: string; icone: string; titulo: string }> = {
  sucesso: { cor: 'success', icone: 'bi-check-circle-fill', titulo: 'Tudo certo!' },
  erro: { cor: 'danger', icone: 'bi-x-circle-fill', titulo: 'Algo deu errado' },
  aviso: { cor: 'warning', icone: 'bi-exclamation-triangle-fill', titulo: 'Atenção' },
  info: { cor: 'primary', icone: 'bi-info-circle-fill', titulo: 'Informação' },
};

/** Notificações rápidas do ToastService, no canto superior direito. Fica uma vez só, em app.html. */
@Component({
  selector: 'app-toast',
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
})
export class Toast {
  protected readonly toast = inject(ToastService);
  protected readonly duracaoMs = TEMPO.TEMPO_MENSAGEM;

  protected readonly mensagem = computed(() => {
    const mensagem = this.toast.mensagemAtual();
    return mensagem ? { ...mensagem, ...VISUAL_DA_MENSAGEM[mensagem.tipo] } : null;
  });
}
