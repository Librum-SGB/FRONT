import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ExemplarRequest, ExemplarResponse } from '../models/exemplar.model';

@Injectable({ providedIn: 'root' })
export class ExemplarService {
  private apiUrl = `${environment.apiUrl}/exemplares`;

  constructor(private http: HttpClient) { }

  create(exemplar: ExemplarRequest): Observable<ExemplarResponse> {
    return this.http.post<ExemplarResponse>(this.apiUrl, exemplar);
  }

  findAll(): Observable<ExemplarResponse[]> {
    return this.http.get<ExemplarResponse[]>(this.apiUrl);
  }

  findById(id: number): Observable<ExemplarResponse> {
    return this.http.get<ExemplarResponse>(`${this.apiUrl}/${id}`);
  }

  update(id: number, exemplar: ExemplarRequest): Observable<ExemplarResponse> {
    return this.http.put<ExemplarResponse>(`${this.apiUrl}/${id}`, exemplar);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}