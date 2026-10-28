
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MaterialRequest, MaterialResponse } from '../models/material.model';

export interface LivroExterno {
  isbn?: string;
  titulo?: string;
  subtitulo?: string;
  autores?: string[];
  editora?: string;
  anoPublicacao?: number;
  quantidadePaginas?: number;
  sinopse?: string;
  generos?: string[];
}

export interface ConsultaIsbnResponse {
  isbn: string;
  jaCadastrado: boolean;
  encontradoExternamente: boolean;
  livro?: LivroExterno;
}


@Injectable({ providedIn: 'root' })
export class MaterialService {
  private apiUrl = `${environment.apiUrl}/materiais`;

  constructor(private http: HttpClient) { }

  create(material: MaterialRequest): Observable<MaterialResponse> {
    return this.http.post<MaterialResponse>(this.apiUrl, material);
  }

  findAll(): Observable<MaterialResponse[]> {
    return this.http.get<MaterialResponse[]>(this.apiUrl);
  }

  findById(id: number): Observable<MaterialResponse> {
    return this.http.get<MaterialResponse>(`${this.apiUrl}/${id}`);
  }

  update(id: number, material: MaterialRequest): Observable<MaterialResponse> {
    return this.http.put<MaterialResponse>(`${this.apiUrl}/${id}`, material);
  }

  consultarIsbn(isbn: string): Observable<ConsultaIsbnResponse> {
    return this.http.get<ConsultaIsbnResponse>(`${this.apiUrl}/isbn/consulta`, { params: { isbn } });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}