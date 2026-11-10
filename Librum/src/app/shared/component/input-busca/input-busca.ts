import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Busca } from './busca.interface';

interface OpcaoFiltro {
  valor: string;
  label: string;
}

@Component({
  selector: 'app-input-busca',
  imports: [NgClass, FormsModule],
  templateUrl: './input-busca.html',
  styleUrl: './input-busca.scss',
})
export class InputBusca {
  @Input()
  TipoInput: 'LIVRO' | 'USUARIO' = 'LIVRO';
  @Input()
  showSelect: boolean = false;
  @Input()
  placeholder = '';
  @Input()
  buscarAoDigitar = false;

  @Output()
  buscar = new EventEmitter<Busca>();
  filtroSelecionado = 'TODOS';
  textoBusca = '';

  readonly OPCOES_USUARIO: OpcaoFiltro[] = [
    { valor: 'TODOS', label: 'Todos' },
    { valor: 'NOME', label: 'Nome' },
    { valor: 'ID', label: 'ID' },
  ];

  readonly OPCOES_LIVRO: OpcaoFiltro[] = [
    { valor: 'TODOS', label: 'Todos' },
    { valor: 'TITULO', label: 'Título' },
    { valor: 'ID', label: 'ID' },
    { valor: 'ISBN', label: 'ISBN' },
    { valor: 'AUTOR', label: 'Autor' },
    { valor: 'GENERO', label: 'Gênero' },
  ];

  get opcoesFiltro(): OpcaoFiltro[] {
    return this.TipoInput === 'LIVRO' ? this.OPCOES_LIVRO : this.OPCOES_USUARIO;
  }

  get placeholderBusca(): string {
    return this.placeholder || (this.TipoInput === 'LIVRO' ? 'Digite o título do livro' : 'Digite o nome do usuário');
  }

  pesquisar(event: SubmitEvent): void {
    event.preventDefault();
    this.emitirBusca();
  }

  pesquisarAoDigitar(): void {
    if (this.buscarAoDigitar) this.emitirBusca();
  }

  filtroAlterado(): void {
    if (this.buscarAoDigitar) this.emitirBusca();
  }

  private emitirBusca(): void {
    this.buscar.emit({
      texto: this.textoBusca,
      filtro: this.filtroSelecionado,
    });
  }
}
