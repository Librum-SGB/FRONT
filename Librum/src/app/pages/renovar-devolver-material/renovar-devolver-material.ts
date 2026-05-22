import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// Import da sua Badge que vimos na foto do seu VS Code
import { Badge } from '../../shared/component/badge/badge'; 

@Component({
  selector: 'app-renovar-devolver-material',
  standalone: true,
  imports: [CommonModule, FormsModule, Badge], // Adicionado a Badge aqui
  templateUrl: './renovar-devolver-material.html',
  styleUrl: './renovar-devolver-material.scss',
})
export class RenovarDevolverMaterial {
  searchId: string = '';
  emprestimoSelecionado: any = null;

  emprestimos = [
    { id: 'EMP-001', usuario: 'Juanito Silva', livro: 'Programação em Python', dataDevolucao: '19/11/2025', vencido: false },
    { id: 'EMP-002', usuario: 'Maria Cecília Santos', livro: 'JavaScript Avançado', dataDevolucao: '18/11/2025', vencido: false },
    { id: 'EMP-008', usuario: 'Rafael Souza', livro: 'Banco de Dados NoSQL', dataDevolucao: '26/11/2025', vencido: true },
    { id: 'EMP-003', usuario: 'Rodolfo Alberto Souza', livro: 'React e Redux', dataDevolucao: '10/11/2025', vencido: true },
    { id: 'EMP-004', usuario: 'Ana Julia Costa', livro: 'Node.js Completo', dataDevolucao: '21/11/2025', vencido: false },
    { id: 'EMP-005', usuario: 'João Henrique Lima', livro: 'TypeScript Guide', dataDevolucao: '14/11/2025', vencido: true },
    { id: 'EMP-006', usuario: 'Allan Ferreira', livro: 'Angular na Prática', dataDevolucao: '24/11/2025', vencido: false },
    { id: 'EMP-007', usuario: 'Priscilla Novaes ', livro: 'UX Design 101', dataDevolucao: '15/11/2025', vencido: true },
  ];

  // AQUI ESTÁ A SUA PESQUISA INTELIGENTE:
  onSearch() {
    const termo = this.searchId.trim().toUpperCase();

    // Se limpar o campo, remove o empréstimo selecionado da tela
    if (!termo) {
      this.emprestimoSelecionado = null;
      return;
    }

    // Verifica se digitou APENAS números (ex: "3" ou "003")
    const apenasNumeros = /^\d+$/.test(termo);

    if (apenasNumeros) {
      // Transforma "3" em "003" para bater com o padrão "EMP-003"
      const numeroFormatado = termo.padStart(3, '0'); 
      const idParaBuscar = `EMP-${numeroFormatado}`;
      
      this.emprestimoSelecionado = this.emprestimos.find(e => e.id === idParaBuscar) || null;
    } else {
      // Se digitou letras, busca por parte do nome do Usuário, do Livro ou ID completo
      this.emprestimoSelecionado = this.emprestimos.find(e => 
        e.usuario.toUpperCase().includes(termo) || 
        e.livro.toUpperCase().includes(termo) ||
        e.id.toUpperCase() === termo
      ) || null;
    }
  }

  selecionar(emp: any) {
    this.emprestimoSelecionado = emp;
    this.searchId = emp.id;
  }

  renovar() { alert('Renovado!'); }
  devolver() { alert('Devolvido!'); }
}