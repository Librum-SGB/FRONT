import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../shared/services/toast.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-editar-excluir-material',
  imports: [CommonModule, FormsModule],
  templateUrl: './editar-excluir-material.html',
  styleUrl: './editar-excluir-material.scss',
})
export class EditarExcluirMaterial {

  constructor(private toastService: ToastService) { }

  materiais = [
    {
      codigo: 'L-00001',
      titulo: 'Programação em Python',
      tipo: 'Livro',
      autor: 'João',
      editora: 'Novatec',
      anoPublicacao: 2020,
      genero: 'Tecnologia',
      localizacao: 'Estante A1',
      exemplares: 5,
      unidade: 'Central',
      disponibilidade: 'Disponível'
    },
    {
      codigo: 'L-00002',
      titulo: 'Gestão de Projetos Ágeis',
      tipo: 'Livro',
      autor: 'Maria',
      editora: 'Alta Books',
      anoPublicacao: 2019,
      genero: 'Administração',
      localizacao: 'Estante B2',
      exemplares: 3,
      unidade: 'Norte',
      disponibilidade: 'Disponível'
    },
    {
      codigo: 'L-00003',
      titulo: 'Eletrônica Digital Avançada',
      tipo: 'Livro',
      autor: 'Carlos',
      editora: 'Pearson',
      anoPublicacao: 2018,
      genero: 'Engenharia',
      localizacao: 'Estante C3',
      exemplares: 2,
      unidade: 'Sul',
      disponibilidade: 'Indisponível'
    },
    {
      codigo: 'P-00001',
      titulo: 'Revista Tecnologia Hoje',
      tipo: 'Livro',
      autor: 'Editora X',
      editora: 'Editora X',
      anoPublicacao: 2023,
      genero: 'Revista',
      localizacao: 'Estante D1',
      exemplares: 10,
      unidade: 'Central',
      disponibilidade: 'Disponível'
    }
  ];

  materialSelecionado: any;

  selecionarMaterial(material: any) {
    this.materialSelecionado = material;
  }

  materialEditando: any = {};

  abrirEdicao(material: any) {
    this.materialEditando = { ...material };
  }

  salvarEdicao() {
    const index = this.materiais.findIndex(m => m.codigo === this.materialEditando.codigo);

    if (index !== -1) {
      this.materiais[index] = this.materialEditando;
    }

    console.log('Editado:', this.materialEditando);
  }

  excluirMaterial(material: any) {
    this.toastService.showToast('success', `Material "${material.titulo}" excluído com sucesso.`);
    this.materiais = this.materiais.filter(m => m !== material);
  }

  tipoFiltro: string = 'todos';
  textoBusca: string = '';

  materiaisFiltrados() {
    const busca = this.textoBusca.toLowerCase();

    return this.materiais.filter(material => {

      // Se não digitou nada, mostra tudo
      if (!busca) return true;

      switch (this.tipoFiltro) {

        case 'codigo':
          return material.codigo.toLowerCase().includes(busca);

        case 'titulo':
          return material.titulo.toLowerCase().includes(busca);

        case 'autor':
          return material.autor.toLowerCase().includes(busca);

        case 'genero':
          return material.genero.toLowerCase().includes(busca);

        case 'todos':
        default:
          return (
            material.codigo.toLowerCase().includes(busca) ||
            material.titulo.toLowerCase().includes(busca) ||
            material.autor.toLowerCase().includes(busca) ||
            material.genero.toLowerCase().includes(busca)
          );
      }

    });
  }

}