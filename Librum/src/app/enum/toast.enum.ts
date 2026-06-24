export interface MensagemToast {
  texto: string;
  tipo: 'sucesso' | 'erro' | 'aviso' | 'info';
}

export const TEMPO = {
  //miliseconds
  TEMPO_MENSAGEM: 3000,
};
