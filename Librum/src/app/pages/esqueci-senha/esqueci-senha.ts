import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-esqueci-senha',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './esqueci-senha.html',
  styleUrls: ['./esqueci-senha.scss']
})
export class EsqueciSenhaComponent {

  email: string = ''; 

  constructor(private router: Router) {}

  enviar() {
    alert('Email de recuperação enviado para: ' + this.email);
  }

  voltarLogin() {
    this.router.navigate(['/']);
  }
}