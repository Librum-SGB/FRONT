import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of, switchMap, timer } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AmostraMetricas {
  instante: number;
  status: string;
  cpuSistema: number | null;
  cpuProcesso: number | null;
  heapUsado: number | null;
  heapMax: number | null;
  threads: number | null;
  classes: number | null;
  uptimeSegundos: number | null;
  requisicoes: number | null;
  requisicoesErro: number | null;
  tempoTotalRequisicoes: number | null;
  tempoMaxRequisicoes: number | null;
  gcPausas: number | null;
  conexoesAtivas: number | null;
  conexoesMax: number | null;
  discoLivre: number | null;
  discoTotal: number | null;
}

interface MetricaResposta {
  measurements?: { statistic: string; value: number }[];
}

@Injectable({ providedIn: 'root' })
export class MonitoramentoService {
  private base = `${environment.apiBaseUrl}/actuator`;

  constructor(private http: HttpClient) {}

  acompanhar(intervaloMs = 2000): Observable<AmostraMetricas> {
    return timer(0, intervaloMs).pipe(switchMap(() => this.coletar()));
  }

  private metrica(nome: string, estatistica: string, tag?: string): Observable<number | null> {
    const sufixo = tag ? `?tag=${encodeURIComponent(tag)}` : '';
    return this.http.get<MetricaResposta>(`${this.base}/metrics/${nome}${sufixo}`).pipe(
      map((r) => r.measurements?.find((m) => m.statistic === estatistica)?.value ?? null),
      catchError(() => of(null)),
    );
  }

  private coletar(): Observable<AmostraMetricas> {
    const status$ = this.http.get<{ status: string }>(`${this.base}/health`).pipe(
      map((r) => r.status),
      catchError((erro) => of(erro?.error?.status ?? 'DOWN')),
    );

    return forkJoin({
      status: status$,
      cpuSistema: this.metrica('system.cpu.usage', 'VALUE'),
      cpuProcesso: this.metrica('process.cpu.usage', 'VALUE'),
      heapUsado: this.metrica('jvm.memory.used', 'VALUE', 'area:heap'),
      heapMax: this.metrica('jvm.memory.max', 'VALUE', 'area:heap'),
      threads: this.metrica('jvm.threads.live', 'VALUE'),
      classes: this.metrica('jvm.classes.loaded', 'VALUE'),
      uptimeSegundos: this.metrica('process.uptime', 'VALUE'),
      requisicoes: this.metrica('http.server.requests', 'COUNT'),
      requisicoesErro: this.metrica('http.server.requests', 'COUNT', 'outcome:SERVER_ERROR'),
      tempoTotalRequisicoes: this.metrica('http.server.requests', 'TOTAL_TIME'),
      tempoMaxRequisicoes: this.metrica('http.server.requests', 'MAX'),
      gcPausas: this.metrica('jvm.gc.pause', 'COUNT'),
      conexoesAtivas: this.metrica('hikaricp.connections.active', 'VALUE'),
      conexoesMax: this.metrica('hikaricp.connections.max', 'VALUE'),
      discoLivre: this.metrica('disk.free', 'VALUE'),
      discoTotal: this.metrica('disk.total', 'VALUE'),
    }).pipe(map((dados) => ({ instante: Date.now(), ...dados })));
  }
}
