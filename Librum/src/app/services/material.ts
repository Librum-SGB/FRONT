import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MaterialRequest, MaterialResponse } from '../models/material.model';


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
}