import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tela-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tela-login.html',
  styleUrls: ['./tela-login.scss']
})
export class TelaLoginComponent {

  email: string = '';
  senha: string = '';
  mostrarSenha: boolean = false;

  toggleSenha() {
    this.mostrarSenha = !this.mostrarSenha;
  }

  entrar() {
    if (this.email && this.senha) {
      alert(`Bem-vindo ${this.email}`);
    } else {
      alert('Preencha email e senha');
    }
  }
}