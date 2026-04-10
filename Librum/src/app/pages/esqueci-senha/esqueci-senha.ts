import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-esqueci-senha',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './esqueci-senha.html',
  styleUrls: ['./esqueci-senha.scss']
})
export class EsqueciSenhaComponent {

  email: string = ''; 

  constructor(private router: Router, private toastService: ToastService) {}

  enviar() {
    
    this.toastService.showInfo(`Email de recuperação enviado para: ${this.email}`, 'Recuperação');
  }

  voltarLogin() {
    this.router.navigate(['/']);
  }
}
