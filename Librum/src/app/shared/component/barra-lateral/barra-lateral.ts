import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
@Component({
  selector: 'app-barra-lateral',
  imports: [CommonModule, RouterModule], // <-- DEVE IMPORTAR O ROUTER AQUI
  templateUrl: './barra-lateral.html',
  styleUrl: './barra-lateral.scss',
})
export class BarraLateralComponent {

  constructor(private router: Router) {}

  logout(): void {
    // Aqui vai a sua lógica de logout chamando o backend Java
    console.log('Realizando logoff...');
    // this.router.navigate(['/login']); // Exemplo de redirecionamento após o logout
  }
}