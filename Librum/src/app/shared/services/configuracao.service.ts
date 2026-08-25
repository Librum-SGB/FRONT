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

  public static ATIVO = 'A';
  public static INATIVO = 'I';

  // Tela
  public static CHAVE_ACAO_RAPIDA = 'EXIBIR_ACAO_RAPIDA';

  // Aparência
  public static CHAVE_TEMA = 'TEMA'; // valor: 'light' | 'dark'

  // Notificações
  public static CHAVE_NOTIFICACOES_GERAIS = 'NOTIFICACOES_GERAIS';
  public static CHAVE_NOTIFICACOES_EMAIL = 'NOTIFICACOES_EMAIL';
  public static CHAVE_NOTIFICACOES_ALERTAS = 'NOTIFICACOES_ALERTAS';

  private configuracoes: ConfiguracaoUsuario[] = [
    { id: 1, filialId: 1, chave: ConfiguracaoService.CHAVE_ACAO_RAPIDA, valor: 'I' },
    { id: 2, filialId: 1, chave: ConfiguracaoService.CHAVE_TEMA, valor: 'light' },
    { id: 3, filialId: 1, chave: ConfiguracaoService.CHAVE_NOTIFICACOES_GERAIS, valor: 'A' },
    { id: 4, filialId: 1, chave: ConfiguracaoService.CHAVE_NOTIFICACOES_EMAIL, valor: 'A' },
    { id: 5, filialId: 1, chave: ConfiguracaoService.CHAVE_NOTIFICACOES_ALERTAS, valor: 'A' },
  ];

  constructor(private http: HttpClient) {}

  getByChave(chave: string, filialId: number): ConfiguracaoUsuario | undefined {
    return this.configuracoes.find((c) => c.chave === chave && c.filialId === filialId);
  }

  getAll(filialId: number): ConfiguracaoUsuario[] {
    return this.configuracoes.filter((c) => c.filialId === filialId);
  }

  getValor(chave: string, filialId: number): string | undefined {
    return this.getByChave(chave, filialId)?.valor;
  }

  configuracaoAtivaByChave(chave: string, filialId: number): boolean {
    return this.getByChave(chave, filialId)?.valor === ConfiguracaoService.ATIVO ? true : false;
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

  definirValor(chave: string, filialId: number, valor: string): void {
    const config = this.getByChave(chave, filialId);

    if (!config) {
      return;
    }

    config.valor = valor;
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
}
