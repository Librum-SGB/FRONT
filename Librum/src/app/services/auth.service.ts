import { computed, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { FuncaoUsuario } from '../enum/funcaoUsuario.enum';
import { Permissao, PERMISSOES_POR_FUNCAO } from '../enum/permissoes.enum';

export const AUTH_TOKEN_KEY = 'mylibrum.auth.token';

interface JwtPayload {
  sub?: string;
  exp?: number;
  funcao?: string;
  role?: string;
  roles?: string[];
  authorities?: string[];
  [chave: string]: unknown;
}

function decodificarJwt(token: string | null): JwtPayload | null {
  if (!token) return null;
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  type: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly loginUrl = `${environment.apiBaseUrl}/auth/login`;

  constructor(private readonly http: HttpClient) {}

  private readonly _token = signal<string | null>(sessionStorage.getItem(AUTH_TOKEN_KEY));

  readonly payload = computed(() => decodificarJwt(this._token()));

  readonly funcao = computed<FuncaoUsuario | null>(() => {
    const p = this.payload();
    if (!p) return null;

    const bruto = p.funcao ?? p.role ?? p.roles?.[0] ?? p.authorities?.[0];
    if (!bruto) return null;

    const normalizado = String(bruto)
      .replace(/^ROLE_/, '')
      .toUpperCase();
    return Object.values(FuncaoUsuario).includes(normalizado as FuncaoUsuario)
      ? (normalizado as FuncaoUsuario)
      : null;
  });

  /** Lista de permissões da função atual */
  readonly permissoes = computed<Permissao[]>(() => {
    const f = this.funcao();
    return f ? PERMISSOES_POR_FUNCAO[f] : [];
  });

  /** Token existe e não expirou */
  estaLogado(): boolean {
    const token = this._token();
    if (!token) return false;
    const exp = this.payload()?.exp;
    return !exp || exp * 1000 > Date.now();
  }

  temFuncao(...funcoes: FuncaoUsuario[]): boolean {
    const atual = this.funcao();
    return !!atual && funcoes.includes(atual);
  }

  /** Precisa ter TODAS as permissões informadas */
  temPermissao(...necessarias: Permissao[]): boolean {
    const atuais = this.permissoes();
    return necessarias.every((p) => atuais.includes(p));
  }

  /** Basta ter UMA das permissões informadas */
  temAlgumaPermissao(...necessarias: Permissao[]): boolean {
    const atuais = this.permissoes();
    return necessarias.some((p) => atuais.includes(p));
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.loginUrl, credentials);
  }

  saveToken(token: string): void {
    sessionStorage.setItem(AUTH_TOKEN_KEY, token);
    this._token.set(token);
  }

  getToken(): string | null {
    return this._token();
  }

  isAdmin(): boolean {
    const token = this.getToken();
    const payload = token?.split('.')[1];

    if (!payload) {
      return false;
    }

    try {
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const claims: { funcao?: string } = JSON.parse(
        atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')),
      );
      return claims.funcao === 'ADMIN';
    } catch {
      return false;
    }
  }

  logout(): void {
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    this._token.set(null);
  }
}
