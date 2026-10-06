import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

export class FormUtils {
  private constructor() {}

  static isInvalido(form: FormGroup, campo: string, enviado: boolean): boolean {
    const control = form.get(campo);
    return !!(control?.invalid && enviado);
  }

  static gerarMensagensErro(form: FormGroup, nomesCampos: Record<string, string> = {}): string[] {
    const mensagens: string[] = [];
    let possuiRequired = false;

    Object.keys(form.controls).forEach((campo) => {
      const control = form.get(campo);
      if (!control?.errors) return;

      if (control.hasError('required')) possuiRequired = true;

      const nome = nomesCampos[campo] ?? campo;

      if (control.hasError('minlength')) {
        const { requiredLength } = control.getError('minlength');
        mensagens.push(`${nome} deve possuir no mínimo ${requiredLength} caracteres.`);
      }
      if (control.hasError('maxlength')) {
        const { requiredLength } = control.getError('maxlength');
        mensagens.push(`${nome} deve possuir no máximo ${requiredLength} caracteres.`);
      }
      if (control.hasError('min')) {
        mensagens.push(`${nome} deve ser maior ou igual a ${control.getError('min').min}.`);
      }
      if (control.hasError('max')) {
        mensagens.push(`${nome} deve ser menor ou igual a ${control.getError('max').max}.`);
      }
      if (control.hasError('pattern')) {
        mensagens.push(`${nome} possui um formato inválido.`);
      }
      if (control.hasError('email')) {
        mensagens.push(`${nome} deve ser um e-mail válido.`);
      }
      if (control.hasError('cpfInvalido')) {
        mensagens.push(`${nome} é inválido.`);
      }
      if (control.hasError('senhasDiferentes')) {
        mensagens.push('As senhas não coincidem.');
      }
      if (control.hasError('dataFutura')) {
        mensagens.push(`${nome} deve ser uma data no passado.`);
      }
    });

    if (possuiRequired) {
      mensagens.push('Preencha todos os campos obrigatórios.');
    }

    return mensagens;
  }

  static igualA(outroCampo: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const outro = control.parent?.get(outroCampo);
      return outro && control.value !== outro.value ? { senhasDiferentes: true } : null;
    };
  }

  static cpf(control: AbstractControl): ValidationErrors | null {
    const valor = (control.value ?? '').replace(/\D/g, '');
    if (!valor) return null; // o required cuida do vazio

    if (valor.length !== 11 || /^(\d)\1{10}$/.test(valor)) {
      return { cpfInvalido: true };
    }

    for (let t = 9; t < 11; t++) {
      let soma = 0;
      for (let i = 0; i < t; i++) {
        soma += Number(valor[i]) * (t + 1 - i);
      }
      const dv = ((soma * 10) % 11) % 10;
      if (dv !== Number(valor[t])) return { cpfInvalido: true };
    }
    return null;
  }

  static dataPassada(control: AbstractControl): ValidationErrors | null {
    const valor = control.value;
    if (!valor) return null; // o required cuida do vazio

    // input type="date" devolve "yyyy-MM-dd"; criar com hora local evita erro de fuso
    const [ano, mes, dia] = String(valor).split('-').map(Number);
    const data = new Date(ano, mes - 1, dia);

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    return data < hoje ? null : { dataFutura: true };
  }
}
