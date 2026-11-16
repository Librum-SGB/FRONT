import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { Emprestimo } from '../models/emprestimo.model';
import { ConfirmacaoService, DetalheConfirmacao } from '../shared/services/confirmacao.service';
import { ToastService } from '../shared/services/toast.service';
import { formatarDataBR } from '../utils/data.util';
import { diasDeAtraso } from '../utils/emprestimo.util';
import { EmprestimoService } from './emprestimo.service';

/**
 * Renovação e devolução com confirmação: mostra o que vai acontecer, pede confirmação,
 * executa e avisa o resultado. Usado pela tela Renovar/Devolver e pelo detalhe do empréstimo.
 * Retorna o empréstimo atualizado, ou `null` se a ação foi cancelada ou falhou.
 */
@Injectable({ providedIn: 'root' })
export class OperacoesEmprestimoService {
  private readonly emprestimoService = inject(EmprestimoService);
  private readonly confirmacao = inject(ConfirmacaoService);
  private readonly toast = inject(ToastService);

  async renovar(emprestimo: Emprestimo): Promise<Emprestimo | null> {
    if (emprestimo.id == null) return null;

    let previa;
    try {
      previa = await firstValueFrom(this.emprestimoService.previaRenovacao(emprestimo.id));
    } catch (erro) {
      this.toast.erro(this.mensagemErro(erro, 'Não foi possível consultar a renovação.'));
      return null;
    }

    if (!previa.permitida) {
      this.toast.aviso(`Não é possível renovar: ${previa.motivo ?? 'renovação não permitida.'}`);
      return null;
    }

    const detalhes: DetalheConfirmacao[] = [
      ...this.identificacao(emprestimo),
      { rotulo: 'Devolução atual', valor: formatarDataBR(previa.dataDevolucaoAtual) },
      { rotulo: 'Nova devolução', valor: formatarDataBR(previa.novaDataDevolucao), destaque: true },
    ];
    if (previa.limiteRenovacoes != null) {
      detalhes.push(
        {
          rotulo: 'Renovação',
          valor: `${previa.renovacoesRealizadas + 1}ª de ${previa.limiteRenovacoes}`,
        },
        {
          rotulo: 'Restam depois',
          valor: this.plural(previa.renovacoesRestantes ?? 0, 'renovação', 'renovações'),
          destaque: true,
        },
      );
    }

    const confirmado = await this.confirmacao.confirmar({
      titulo: 'Renovar empréstimo',
      icone: 'bi-arrow-repeat',
      tom: 'primary',
      mensagem: `Você está renovando o empréstimo #${emprestimo.id}.`,
      detalhes,
      aviso: previa.renovacoesRestantes === 0 ? 'Esta é a última renovação permitida.' : undefined,
      textoConfirmar: 'Confirmar renovação',
    });
    if (!confirmado) return null;

    try {
      const atualizado = await firstValueFrom(this.emprestimoService.renovar(emprestimo.id));
      this.toast.sucesso(
        `Empréstimo renovado! Nova devolução: ${formatarDataBR(atualizado.dataDevolucaoPrevista)}.`,
      );
      return atualizado;
    } catch (erro) {
      this.toast.erro(this.mensagemErro(erro, 'Não foi possível renovar o empréstimo.'));
      return null;
    }
  }

  async devolver(emprestimo: Emprestimo): Promise<Emprestimo | null> {
    if (emprestimo.id == null) return null;

    const atraso = diasDeAtraso(emprestimo);
    const confirmado = await this.confirmacao.confirmar({
      titulo: 'Registrar devolução',
      icone: 'bi-box-arrow-in-down',
      tom: 'success',
      mensagem: `Você está registrando a devolução do empréstimo #${emprestimo.id}.`,
      detalhes: [
        ...this.identificacao(emprestimo),
        { rotulo: 'Emprestado em', valor: formatarDataBR(emprestimo.dataSaida) },
        { rotulo: 'Devolução prevista', valor: formatarDataBR(emprestimo.dataDevolucaoPrevista) },
        {
          rotulo: 'Situação',
          valor: atraso ? `${this.plural(atraso, 'dia', 'dias')} de atraso` : 'No prazo',
          destaque: true,
        },
      ],
      aviso: atraso ? 'A devolução está atrasada. Verifique se há multa a registrar.' : undefined,
      textoConfirmar: 'Confirmar devolução',
    });
    if (!confirmado) return null;

    try {
      const atualizado = await firstValueFrom(this.emprestimoService.devolver(emprestimo.id));
      this.toast.sucesso(`Devolução de "${emprestimo.materialTitulo ?? 'material'}" registrada.`);
      return atualizado;
    } catch (erro) {
      this.toast.erro(this.mensagemErro(erro, 'Não foi possível registrar a devolução.'));
      return null;
    }
  }

  private identificacao(emprestimo: Emprestimo): DetalheConfirmacao[] {
    return [
      { rotulo: 'Usuário', valor: emprestimo.usuarioNome || '—' },
      { rotulo: 'Material', valor: emprestimo.materialTitulo || '—' },
    ];
  }

  private plural(quantidade: number, singular: string, plural: string): string {
    return `${quantidade} ${quantidade === 1 ? singular : plural}`;
  }

  private mensagemErro(erro: unknown, padrao: string): string {
    return erro instanceof HttpErrorResponse ? (erro.error?.message ?? padrao) : padrao;
  }
}
