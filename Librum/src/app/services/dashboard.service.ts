import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { MaterialResponse } from '../models/material.model';
import { ExemplarResponse } from '../models/exemplar.model';
import { StatusEmprestimo } from '../enum/status.enum';

interface UsuarioResumo {
  id: number;
  nome: string;
}

interface UsuarioPage {
  totalElements: number;
}

interface EmprestimoResumo {
  id: number;
  usuarioId: number;
  exemplarId: number;
  status: StatusEmprestimo;
  dataDevolucaoPrevista: string;
}

export interface EmprestimoAtrasado {
  id: number;
  nomeUsuario: string;
  tituloMaterial: string;
  diasAtraso: number;
}

export interface DashboardMetricas {
  usuariosCadastrados: number;
  exemplaresNoAcervo: number;
  emprestimosAtivos: number;
  emprestimosEmAndamento: number;
  emprestimosAVencer: number;
  emprestimosAtrasados: number;
  atrasos: EmprestimoAtrasado[];
}

export interface UsuarioAtual {
  id: number;
  nome: string;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly apiUrl = `${environment.apiUrl}`;

  constructor(private readonly http: HttpClient) {}

  getUsuarioAtual(): Observable<UsuarioAtual> {
    return this.http.get<UsuarioAtual>(`${this.apiUrl}/usuarios/me`);
  }

  getMetricas(): Observable<DashboardMetricas> {
    return forkJoin({
      usuarios: this.http.get<UsuarioPage>(
        `${this.apiUrl}/usuarios?funcao=USUARIO&ativo=true&page=0&size=1`,
      ),
      materiais: this.http.get<MaterialResponse[]>(`${this.apiUrl}/materiais?ativo=true`),
      exemplares: this.http.get<ExemplarResponse[]>(`${this.apiUrl}/exemplares?ativo=true`),
      emprestimos: this.http.get<EmprestimoResumo[]>(`${this.apiUrl}/emprestimos?ativo=true`),
    }).pipe(
      switchMap(({ usuarios, materiais, exemplares, emprestimos }) => {
        const hoje = this.dataLocal(new Date());
        const dataLimite = this.dataLocal(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
        const atrasados = emprestimos.filter(
          (emprestimo) =>
            emprestimo.status === StatusEmprestimo.ATRASADO ||
            (emprestimo.status === StatusEmprestimo.ATIVO &&
              emprestimo.dataDevolucaoPrevista < hoje),
        );
        const usuarioIdsAtrasados = [...new Set(atrasados.map((emprestimo) => emprestimo.usuarioId))];
        const usuarios$ = usuarioIdsAtrasados.length
          ? forkJoin(
              usuarioIdsAtrasados.map((id) =>
                this.http.get<UsuarioResumo>(`${this.apiUrl}/usuarios/${id}`),
              ),
            )
          : of([]);
        const materiaisPorId = new Map(materiais.map((material) => [material.id, material.titulo]));
        const exemplaresPorId = new Map(
          exemplares.map((exemplar) => [exemplar.id, exemplar.materialId]),
        );

        return usuarios$.pipe(
          map((usuariosAtrasados) => {
            const usuariosPorId = new Map(usuariosAtrasados.map((usuario) => [usuario.id, usuario.nome]));
            const atrasos = atrasados
              .map((emprestimo) => {
                const materialId = exemplaresPorId.get(emprestimo.exemplarId);
                return {
                  id: emprestimo.id,
                  nomeUsuario:
                    usuariosPorId.get(emprestimo.usuarioId) ?? `Usuário #${emprestimo.usuarioId}`,
                  tituloMaterial: materialId
                    ? materiaisPorId.get(materialId) ?? 'Material não encontrado'
                    : 'Material não encontrado',
                  diasAtraso: this.diasEntre(emprestimo.dataDevolucaoPrevista, hoje),
                };
              })
              .sort((a, b) => b.diasAtraso - a.diasAtraso);
            const emAndamento = emprestimos.filter(
              (emprestimo) => emprestimo.status === StatusEmprestimo.ATIVO,
            );
            const aVencer = emAndamento.filter(
              (emprestimo) =>
                emprestimo.dataDevolucaoPrevista >= hoje &&
                emprestimo.dataDevolucaoPrevista <= dataLimite,
            );

            return {
              usuariosCadastrados: usuarios.totalElements,
              exemplaresNoAcervo: exemplares.length,
              emprestimosAtivos: emprestimos.filter(
                (emprestimo) =>
                  emprestimo.status === StatusEmprestimo.ATIVO ||
                  emprestimo.status === StatusEmprestimo.ATRASADO,
              ).length,
              emprestimosEmAndamento: emAndamento.length,
              emprestimosAVencer: aVencer.length,
              emprestimosAtrasados: atrasos.length,
              atrasos,
            };
          }),
        );
      }),
    );
  }

  private dataLocal(data: Date): string {
    const ano = data.getFullYear();
    const mes = `${data.getMonth() + 1}`.padStart(2, '0');
    const dia = `${data.getDate()}`.padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  private diasEntre(inicio: string, fim: string): number {
    const [anoInicio, mesInicio, diaInicio] = inicio.split('-').map(Number);
    const [anoFim, mesFim, diaFim] = fim.split('-').map(Number);
    const inicioUtc = Date.UTC(anoInicio, mesInicio - 1, diaInicio);
    const fimUtc = Date.UTC(anoFim, mesFim - 1, diaFim);
    return Math.max(0, Math.round((fimUtc - inicioUtc) / (24 * 60 * 60 * 1000)));
  }
}
