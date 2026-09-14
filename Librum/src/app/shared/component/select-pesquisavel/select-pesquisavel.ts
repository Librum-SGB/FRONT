import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  forwardRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface OpcaoSelect {
  id: number;
  nome: string;
}

@Component({
  selector: 'app-select-pesquisavel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './select-pesquisavel.html',
  styleUrl: './select-pesquisavel.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectPesquisavel),
      multi: true,
    },
  ],
})
export class SelectPesquisavel implements ControlValueAccessor, OnChanges {
  @Input() itens: OpcaoSelect[] = [];
  @Input() placeholder = 'Digite para buscar...';
  @Input() multiplo = false;
  @Input() permitirCriar = true;
  @Input() invalido = false;

  @Output() criar = new EventEmitter<void>();

  busca = '';
  mostrarLista = false;
  itensFiltrados: OpcaoSelect[] = [];

  valorUnico: number | null = null;
  valoresMultiplos: number[] = [];

  private onChange: (value: any) => void = () => { };
  private onTouched: () => void = () => { };

  constructor(private elementRef: ElementRef) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['itens']) {
      this.atualizarBuscaExibida();
      this.filtrar();
    }
  }

  // Fecha a lista ao clicar em qualquer lugar fora do componente
  @HostListener('document:click', ['$event'])
  onClickFora(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.mostrarLista = false;
    }
  }

  writeValue(value: number | number[] | null): void {
    if (this.multiplo) {
      this.valoresMultiplos = Array.isArray(value) ? [...value] : [];
    } else {
      this.valorUnico = (value as number) ?? null;
      this.atualizarBuscaExibida();
    }
    this.filtrar();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  private atualizarBuscaExibida(): void {
    if (!this.multiplo && this.valorUnico != null) {
      const item = this.itens.find((i) => i.id === this.valorUnico);
      this.busca = item?.nome ?? '';
    }
  }

  filtrar(): void {
    const termo = this.busca.toLowerCase().trim();
    this.itensFiltrados = this.itens.filter((i) => {
      const bate = i.nome.toLowerCase().includes(termo);
      return this.multiplo ? bate && !this.valoresMultiplos.includes(i.id) : bate;
    });
  }

  abrirLista(): void {
    this.mostrarLista = true;
    this.filtrar();
  }

  selecionar(item: OpcaoSelect): void {
    if (this.multiplo) {
      if (!this.valoresMultiplos.includes(item.id)) {
        this.valoresMultiplos = [...this.valoresMultiplos, item.id];
        this.onChange(this.valoresMultiplos);
      }
      this.busca = '';
    } else {
      this.valorUnico = item.id;
      this.busca = item.nome;
      this.onChange(this.valorUnico);
    }
    this.mostrarLista = false;
    this.onTouched();
    this.filtrar();
  }

  remover(id: number): void {
    this.valoresMultiplos = this.valoresMultiplos.filter((v) => v !== id);
    this.onChange(this.valoresMultiplos);
    this.filtrar();
  }

  nomeDoItem(id: number): string {
    return this.itens.find((i) => i.id === id)?.nome ?? '';
  }

  onCriarClick(): void {
    this.criar.emit();
  }

  // Chamado de fora (pelo componente pai) pra já selecionar o item recém-criado no modal
  selecionarPorId(id: number): void {
    const item = this.itens.find((i) => i.id === id);
    if (item) this.selecionar(item);
  }
}