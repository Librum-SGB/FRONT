export class MaskConstants {
  static readonly CPF = {
    mask: '000.000.000-00',
  };

  static readonly CNPJ = {
    mask: '00.000.000/0000-00',
  };

  static readonly CPF_CNPJ = {
    mask: '000.000.000-00',
  };

  static readonly CEP = {
    mask: '00000-000',
  };

  static readonly CELULAR = {
    mask: '(00) 00000-0000',
  };

  static readonly TELEFONE = {
    mask: '(00) 0000-0000',
  };

  static readonly DATA = {
    mask: '00/00/0000',
  };

  static readonly HORA = {
    mask: '00:00',
  };

  static readonly NUMERO = {
    mask: Number,
  };

  static readonly INTEIRO = {
    mask: Number,
    min: 0,
    scale: 0,
  };

  static readonly MOEDA = {
    mask: Number,
    scale: 2,
    thousandsSeparator: '.',
    radix: ',',
    mapToRadix: ['.'],
    normalizeZeros: true,
    padFractionalZeros: true,
  };
}
/*
export class CadastroComponent {
  protected readonly Mask = MaskConstants;
}


2. No HTML:

<!-- Máscara de CPF -->
<input [imask]="Mask.CPF" />

<!-- Apenas números -->
<input [imask]="Mask.NUMERO" />
*/
