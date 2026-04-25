import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cadastrar-usuario',
  imports: [FormsModule],
  templateUrl: './cadastrar-usuario.html',
  styleUrl: './cadastrar-usuario.scss',
})
export class CadastrarUsuario implements OnInit {

  usuario: any = {};
  confirmarSenha: string = '';

  ngOnInit() {
    this.gerarId();
    this.setDataAtual();
    this.usuario.status = 'Ativo';
  }

  gerarId() {
    // Simulação (normalmente vem do backend)
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
    if (this.usuario.senha !== this.confirmarSenha) {
      alert('As senhas não coincidem!');
      return;
    }

    console.log('Usuário salvo:', this.usuario);
    alert('Usuário cadastrado com sucesso!');
  }

  cancelar() {
    console.log('Cancelado');
  }

}
