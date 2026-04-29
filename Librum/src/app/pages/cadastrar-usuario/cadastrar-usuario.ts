import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-cadastrar-usuario',
  imports: [FormsModule],
  templateUrl: './cadastrar-usuario.html',
  styleUrl: './cadastrar-usuario.scss',
})
export class CadastrarUsuario implements OnInit {

  usuario: any = {};
  confirmarSenha: string = '';

  constructor(
    private router: Router,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.gerarId();
    this.setDataAtual();
    this.usuario.status = 'Ativo';
  }

  gerarId() {
    this.usuario.id = 'USR-' + Math.floor(1000 + Math.random() * 9000);
  }

  setDataAtual() {
    const hoje = new Date();
    this.usuario.dataCadastro = hoje.toLocaleDateString('pt-BR');
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    this.usuario.foto = file;
  }

  salvar() {

    if (!this.usuario.senha || !this.confirmarSenha) {
          this.toastService.showToast('info', 'As senhas são diferentes.');
      return;
    }

    if (this.usuario.senha !== this.confirmarSenha) {
      this.toastService.showToast('error', 'As senhas não coincidem!');
      return;
    }

    this.toastService.showToast('success', 'Usuário cadastrado com sucesso!');
    this.router.navigate(['/dashboard']);

  }

  cancelar() {
    this.toastService.showToast('info', 'Cadastro de usuário cancelado.');
    this.router.navigate(['/dashboard']);
  }

}