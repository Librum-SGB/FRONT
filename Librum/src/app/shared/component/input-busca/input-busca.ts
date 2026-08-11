import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

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

  pesquisar(event: SubmitEvent): void {
    event.preventDefault();

    this.buscar.emit({
      texto: this.textoBusca,
      filtro: this.filtroSelecionado,
    });
  }
}
