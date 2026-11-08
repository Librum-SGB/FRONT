import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AmostraMetricas, MonitoramentoService } from '../../services/monitoramento.service';
import { CorpoPadrao } from '../../shared/component/corpo-padrao/corpo-padrao';
import { GraficoLinha } from '../../shared/component/grafico-linha/grafico-linha';

const JANELA = 60;

@Component({
  selector: 'app-monitoramento',
  imports: [CommonModule, CorpoPadrao, GraficoLinha],
  templateUrl: './monitoramento.html',
  styleUrl: './monitoramento.scss',
})
export class Monitoramento implements OnInit {
  private servico = inject(MonitoramentoService);
  private destroyRef = inject(DestroyRef);

  protected readonly janela = JANELA;
  protected atual = signal<AmostraMetricas | null>(null);
  protected conectado = signal(true);
  protected cpuSistema = signal<number[]>([]);
  protected cpuProcesso = signal<number[]>([]);
  protected heap = signal<number[]>([]);
  protected threads = signal<number[]>([]);
  protected reqPorSegundo = signal<number[]>([]);
  protected latenciaMedia = signal<number[]>([]);

  private anterior: AmostraMetricas | null = null;

  protected heapPercentual = computed(() => this.percentual(this.atual()?.heapUsado, this.atual()?.heapMax));
  protected discoUsadoPercentual = computed(() => {
    const a = this.atual();
    if (a?.discoTotal == null || a.discoLivre == null) return null;
    return this.percentual(a.discoTotal - a.discoLivre, a.discoTotal);
  });
  protected poolPercentual = computed(() => this.percentual(this.atual()?.conexoesAtivas, this.atual()?.conexoesMax));
  protected taxaErro = computed(() => {
    const a = this.atual();
    return a?.requisicoes ? ((a.requisicoesErro ?? 0) / a.requisicoes) * 100 : 0;
  });

  ngOnInit(): void {
    this.servico
      .acompanhar(2000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((amostra) => this.registrar(amostra));
  }

  protected formatarBytes(valor: number | null | undefined): string {
    if (valor == null) return '—';
    const unidades = ['B', 'KB', 'MB', 'GB', 'TB'];
    let i = 0;
    let v = valor;
    while (v >= 1024 && i < unidades.length - 1) {
      v /= 1024;
      i++;
    }
    return `${v.toFixed(1)} ${unidades[i]}`;
  }

  protected formatarUptime(segundos: number | null | undefined): string {
    if (segundos == null) return '—';
    const s = Math.floor(segundos);
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    return `${d > 0 ? d + 'd ' : ''}${h}h ${m}m ${s % 60}s`;
  }

  protected classeStatus(status: string | undefined): string {
    if (status === 'UP') return 'ok';
    if (status === 'OUT_OF_SERVICE' || status === 'UNKNOWN') return 'alerta';
    return 'erro';
  }

  private percentual(valor: number | null | undefined, total: number | null | undefined): number | null {
    return valor == null || !total || total < 0 ? null : (valor / total) * 100;
  }

  private empilhar(sinal: ReturnType<typeof signal<number[]>>, valor: number | null): void {
    sinal.update((lista) => [...lista, valor ?? 0].slice(-JANELA));
  }

  private registrar(a: AmostraMetricas): void {
    this.conectado.set(a.cpuSistema !== null || a.status === 'UP');
    this.atual.set(a);

    this.empilhar(this.cpuSistema, a.cpuSistema != null ? a.cpuSistema * 100 : null);
    this.empilhar(this.cpuProcesso, a.cpuProcesso != null ? a.cpuProcesso * 100 : null);
    this.empilhar(this.heap, a.heapUsado != null ? a.heapUsado / 1048576 : null);
    this.empilhar(this.threads, a.threads);

    const p = this.anterior;
    if (p && a.requisicoes != null && p.requisicoes != null) {
      const dt = (a.instante - p.instante) / 1000;
      const dReq = Math.max(0, a.requisicoes - p.requisicoes);
      this.empilhar(this.reqPorSegundo, dt > 0 ? dReq / dt : 0);
      const dTempo = Math.max(0, (a.tempoTotalRequisicoes ?? 0) - (p.tempoTotalRequisicoes ?? 0));
      this.empilhar(this.latenciaMedia, dReq > 0 ? (dTempo / dReq) * 1000 : 0);
    }
    this.anterior = a;
  }
}
