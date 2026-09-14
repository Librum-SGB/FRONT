import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { EditoraRequest, EditoraResponse } from '../models/editora.model';

@Injectable({
  providedIn: 'root',
})
export class EditoraService {
  private apiUrl = `${environment.apiUrl}/editoras`;

  constructor(private http: HttpClient) { }

  findAll(): Observable<EditoraResponse[]> {
    return this.http.get<EditoraResponse[]>(this.apiUrl);
  }

  create(editora: EditoraRequest): Observable<EditoraResponse> {
    return this.http.post<EditoraResponse>(this.apiUrl, editora);
  }
}
