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

  constructor(private toastService: ToastService) {}

materiais = [
  { codigo: 'L-00001', titulo: 'Programação em Python', autor: 'João', genero: 'Tecnologia', unidade: 'Central' },
  { codigo: 'L-00002', titulo: 'Gestão de Projetos Ágeis', autor: 'Maria', genero: 'Administração', unidade: 'Norte' },
  { codigo: 'L-00003', titulo: 'Eletrônica Digital Avançada', autor: 'Carlos', genero: 'Engenharia', unidade: 'Sul' },
  { codigo: 'P-00001', titulo: 'Revista Tecnologia Hoje', autor: 'Editora X', genero: 'Revista', unidade: 'Central' }
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

}
