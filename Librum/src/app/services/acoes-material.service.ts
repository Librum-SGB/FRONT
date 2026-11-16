import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ConfirmacaoService } from '../shared/services/confirmacao.service';
import { ToastService } from '../shared/services/toast.service';
import { mensagemDeErro } from '../utils/http.util';
import { MaterialExibicao } from '../utils/material.util';
import { MaterialService } from './material';

/** Exclusão de material com confirmação e aviso do resultado (listagem e detalhe usam a mesma). */
@Injectable({ providedIn: 'root' })
export class AcoesMaterialService {
  private readonly materialService = inject(MaterialService);
  private readonly confirmacao = inject(ConfirmacaoService);
  private readonly toast = inject(ToastService);

  /** `exemplares`: quantos existem (para informar na confirmação), ou `null` se não se sabe. */
  async excluir(material: MaterialExibicao, exemplares: number | null): Promise<boolean> {
    const confirmado = await this.confirmacao.confirmar({
      titulo: 'Excluir material',
      icone: 'bi-trash',
      tom: 'danger',
      detalhes: [
        { rotulo: 'Código', valor: material.codigo },
        { rotulo: 'Título', valor: material.titulo, destaque: true },
        { rotulo: 'Tipo', valor: material.tipoLabel },
        ...(exemplares != null ? [{ rotulo: 'Exemplares', valor: String(exemplares) }] : []),
      ],
      aviso: 'O material deixa de aparecer no acervo e nas buscas.',
      textoConfirmar: 'Excluir material',
    });
    if (!confirmado) return false;

    try {
      await firstValueFrom(this.materialService.delete(material.id));
      this.toast.sucesso(`Material "${material.titulo}" excluído com sucesso.`);
      return true;
    } catch (erro) {
      this.toast.erro(mensagemDeErro(erro, 'Erro ao excluir o material.'));
      return false;
    }
  }
}
