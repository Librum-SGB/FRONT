import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { GeneroRequest, GeneroResponse } from '../models/genero.model';

@Injectable({
  providedIn: 'root',
})
export class GeneroService {
  private apiUrl = `${environment.apiUrl}/generos`;

  constructor(private http: HttpClient) { }

  findAll(): Observable<GeneroResponse[]> {
    return this.http.get<GeneroResponse[]>(this.apiUrl);
  }

  create(genero: GeneroRequest): Observable<GeneroResponse> {
    return this.http.post<GeneroResponse>(this.apiUrl, genero);
  }
}