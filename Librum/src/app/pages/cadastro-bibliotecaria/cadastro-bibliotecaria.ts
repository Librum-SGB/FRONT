import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastService } from '../../shared/services/toast.service';

type CargoFuncionario = 'bibliotecaria' | 'assistente' | 'suporte';

@Component({
  selector: 'app-cadastro-bibliotecaria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cadastro-bibliotecaria.html',
  styleUrls: ['./cadastro-bibliotecaria.scss'],
})
export class CadastroBibliotecariaComponent {
  readonly cargos: { value: CargoFuncionario; label: string }[] = [
    { value: 'bibliotecaria', label: 'Bibliotecária' },
    { value: 'assistente', label: 'Assistente' },
    { value: 'suporte', label: 'Suporte' },
  ];

  cargo: CargoFuncionario | '' = '';
  nome = '';
  email = '';
  matricula = '';
  senha = '';
  confirmarSenha = '';
  mostrarSenha = false;
  mostrarConfirmarSenha = false;

  constructor(
    private router: Router,
    private toastService: ToastService,
  ) {}

  toggleSenha(): void {
    this.mostrarSenha = !this.mostrarSenha;
  }

  toggleConfirmarSenha(): void {
    this.mostrarConfirmarSenha = !this.mostrarConfirmarSenha;
  }

  private labelCargo(): string {
    return this.cargos.find((c) => c.value === this.cargo)?.label ?? 'Funcionário';
  }

  cadastrar(): void {
    if (!this.cargo || !this.nome || !this.email || !this.matricula || !this.senha) {
      this.toastService.aviso('Preencha todos os campos obrigatórios!');
      return;
    }
    if (this.senha !== this.confirmarSenha) {
      this.toastService.erro('As senhas não coincidem!');
      return;
    }
    this.toastService.sucesso(`Cadastro de ${this.labelCargo()} realizado com sucesso!`);
    this.router.navigate(['/']);
  }

  voltar(): void {
    this.router.navigate(['/']);
  }
}
