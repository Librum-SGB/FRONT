import { HttpErrorResponse } from '@angular/common/http';

/** Mensagem do backend (`ApiError.message`) ou a mensagem padrão informada. */
export function mensagemDeErro(erro: unknown, padrao: string): string {
  return (erro instanceof HttpErrorResponse && erro.error?.message) || padrao;
}

/** Mensagem para quando uma tela não consegue carregar o registro: 404 vira "não encontrado". */
export function mensagemDeCarregamento(erro: unknown, naoEncontrado: string, padrao: string): string {
  return erro instanceof HttpErrorResponse && erro.status === 404 ? naoEncontrado : mensagemDeErro(erro, padrao);
}
