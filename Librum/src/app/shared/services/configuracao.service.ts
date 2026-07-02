import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ConfiguracaoService {
  configAcaoRapida = new EventEmitter<boolean>();
  private isExibirAcaoRapida: boolean = false;
  alterarExibicaoAcaoRapida() {
    this.isExibirAcaoRapida = !this.isExibirAcaoRapida;
    this.configAcaoRapida.emit(this.isExibirAcaoRapida);
  }

  getExibirAcaoRapida() {
    return this.isExibirAcaoRapida;
  }
}
