import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-grafico-linha',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 300 100" preserveAspectRatio="none" class="grafico" role="img" [attr.aria-label]="titulo()">
      @for (y of [25, 50, 75]; track y) {
        <line x1="0" x2="300" [attr.y1]="y" [attr.y2]="y" class="grade" />
      }
      @if (areaPath()) {
        <path [attr.d]="areaPath()" [attr.fill]="cor()" fill-opacity="0.15" />
        <polyline [attr.points]="pontos()" fill="none" [attr.stroke]="cor()" stroke-width="2" vector-effect="non-scaling-stroke" />
      }
    </svg>
    <div class="escala"><span>0</span><span>{{ maximoFormatado() }}</span></div>
  `,
  styles: `
    :host { display: block; }
    .grafico { width: 100%; height: 120px; background: rgba(127,127,127,.06); border-radius: 6px; }
    .grade { stroke: rgba(127,127,127,.25); stroke-width: 1; vector-effect: non-scaling-stroke; }
    .escala { display: flex; justify-content: space-between; font-size: .7rem; opacity: .6; }
  `,
})
export class GraficoLinha {
  titulo = input('');
  valores = input<number[]>([]);
  cor = input('#0d6efd');
  maximoFixo = input<number | null>(null);
  unidade = input('');
  capacidade = input(60);

  private maximo = computed(() => {
    const fixo = this.maximoFixo();
    if (fixo) return fixo;
    const max = Math.max(0, ...this.valores());
    return max > 0 ? max * 1.2 : 1;
  });

  protected maximoFormatado = computed(() => `${+this.maximo().toFixed(2)}${this.unidade()}`);

  protected pontos = computed(() => {
    const v = this.valores();
    if (v.length < 2) return '';
    const passo = 300 / (this.capacidade() - 1);
    const max = this.maximo();
    const inicio = 300 - (v.length - 1) * passo;
    return v
      .map((valor, i) => `${(inicio + i * passo).toFixed(1)},${(100 - Math.min(valor / max, 1) * 96 - 2).toFixed(1)}`)
      .join(' ');
  });

  protected areaPath = computed(() => {
    const p = this.pontos();
    if (!p) return '';
    const lista = p.split(' ');
    const primeiro = lista[0].split(',')[0];
    return `M${primeiro},100 L${lista.join(' L')} L300,100 Z`;
  });
}
