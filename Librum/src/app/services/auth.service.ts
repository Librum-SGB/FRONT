import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export const AUTH_TOKEN_KEY = 'mylibrum.auth.token';

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

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.loginUrl, credentials);
  }

  saveToken(token: string): void {
    sessionStorage.setItem(AUTH_TOKEN_KEY, token);
  }

  getToken(): string | null {
    return sessionStorage.getItem(AUTH_TOKEN_KEY);
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
  }
}