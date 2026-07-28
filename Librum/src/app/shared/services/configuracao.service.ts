import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ConfiguracaoUsuario } from '../../models/configuracaoUsuario.model';

@Injectable({
  providedIn: 'root',
})
export class ConfiguracaoService {
  private readonly baseUrl = '/api/configuracoes';
  public static CHAVE_ACAO_RAPIDA = 'EXIBIR_ACAO_RAPIDA';
  public static ATIVO = 'A';
  public static INATIVO = 'I';

  private configuracoes: ConfiguracaoUsuario[] = [
    { id: 1, filialId: 1, chave: ConfiguracaoService.CHAVE_ACAO_RAPIDA, valor: 'I' },
    { id: 2, filialId: 1, chave: 'TEMA_ESCURO', valor: 'A' },
    { id: 3, filialId: 1, chave: 'NOTIFICACOES_ATIVAS', valor: 'A' },
  ];

  constructor(private http: HttpClient) {}

  getByChave(chave: string, filialId: number): ConfiguracaoUsuario | undefined {
    return this.configuracoes.find((c) => c.chave === chave && c.filialId === filialId);
  }

  getAll(filialId: number): ConfiguracaoUsuario[] {
    return this.configuracoes.filter((c) => c.filialId === filialId);
  }

  toggleConfiguracao(chave: string, filialId: number): void {
    const config = this.getByChave(chave, filialId);

    if (!config) {
      return;
    }

    config.valor =
      config.valor === ConfiguracaoService.ATIVO
        ? ConfiguracaoService.INATIVO
        : ConfiguracaoService.ATIVO;
  }

  salvar(config: ConfiguracaoUsuario): Observable<ConfiguracaoUsuario> {
    return this.http.post<ConfiguracaoUsuario>(this.baseUrl, config).pipe(
      tap((salvo) => {
        this.configuracoes.push(salvo);
      }),
    );
  }

  atualizar(id: number, config: Partial<ConfiguracaoUsuario>): Observable<ConfiguracaoUsuario> {
    return this.http.put<ConfiguracaoUsuario>(`${this.baseUrl}/${id}`, config).pipe(
      tap((atualizado) => {
        const index = this.configuracoes.findIndex((c) => c.id === id);
        if (index !== -1) {
          this.configuracoes[index] = atualizado;
        }
      }),
    );
  }

  configuracaoAtivaByChave(chave: string, filialId: number): boolean {
    return this.getByChave(chave, filialId)?.valor === ConfiguracaoService.ATIVO ? true : false;
  }
}
