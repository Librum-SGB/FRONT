import { FormGroup } from '@angular/forms';

import { FormUtils } from './FormUtil';

// ---------- Ajustes dos valores antes de enviar ao backend (campo vazio vai como "ausente") ----------

export function textoOuNada(valor: unknown): string | undefined {
  return String(valor ?? '').trim() || undefined;
}

export function numeroOuNada(valor: unknown): number | undefined {
  return valor === null || valor === undefined || valor === '' ? undefined : Number(valor);
}

/** Só os dígitos (CPF, telefone, CEP digitados com máscara). */
export function digitosOuNada(valor: unknown): string | undefined {
  return String(valor ?? '').replace(/\D/g, '') || undefined;
}

/**
 * Base dos formulários de cadastro/edição: marca os campos inválidos e monta as mensagens de erro
 * (no topo e embaixo de cada campo) do mesmo jeito em todas as telas.
 *
 * A tela informa o `form` e o nome de cada campo (`nomesCampos`) e chama `validar()` ao salvar.
 */
export abstract class Formulario {
  abstract readonly form: FormGroup;
  /** Nome de cada campo nas mensagens ("Nome é obrigatório."). */
  protected abstract readonly nomesCampos: Record<string, string>;

  enviado = false;
  mensagensErro: string[] = [];

  isInvalido(campo: string): boolean {
    return FormUtils.isInvalido(this.form, campo, this.enviado);
  }

  erro(campo: string): string | null {
    return FormUtils.mensagemCampo(this.form, campo, this.nomesCampos[campo] ?? campo);
  }

  /** Mostra os erros e diz se dá para salvar. */
  protected validar(): boolean {
    this.enviado = true;
    this.mensagensErro = FormUtils.gerarMensagensErro(this.form, this.nomesCampos);
    return this.form.valid;
  }
}
