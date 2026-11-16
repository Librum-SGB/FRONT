import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AutorRequest, AutorResponse } from '../models/autor.model';

@Injectable({
  providedIn: 'root',
})
export class AutorService {
  private apiUrl = `${environment.apiUrl}/autores`;

  constructor(private http: HttpClient) { }

  findAll(): Observable<AutorResponse[]> {
    return this.http.get<AutorResponse[]>(this.apiUrl);
  }

  create(autor: AutorRequest): Observable<AutorResponse> {
    return this.http.post<AutorResponse>(this.apiUrl, autor);
  }

  findById(id: number): Observable<AutorResponse> {
    return this.http.get<AutorResponse>(`${this.apiUrl}/${id}`);
  }

  update(id: number, autor: AutorRequest): Observable<AutorResponse> {
    return this.http.put<AutorResponse>(`${this.apiUrl}/${id}`, autor);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
