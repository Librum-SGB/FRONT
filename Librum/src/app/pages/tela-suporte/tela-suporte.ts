import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; // 1. ADICIONE ESTE IMPORT

@Component({
  selector: 'app-tela-suporte',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink], // 2. ADICIONE AQUI
  templateUrl: './tela-suporte.html',
  styleUrls: ['./tela-suporte.scss']
})
export class TelaSuporte implements OnInit {
  supportForm!: FormGroup;

  faqs = [
    { question: 'Como cadastrar um novo livro?', answer: 'Vá no menu Cadastrar Material e preencha os dados.', open: false },
    { question: 'Como renovar um empréstimo?', answer: 'Acesse Empréstimos Ativos e clique em renovar.', open: false },
    { question: 'Usuário bloqueado, o que fazer?', answer: 'Regularize as pendências no perfil do usuário.', open: false }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.supportForm = this.fb.group({
      assunto: ['', Validators.required],
      mensagem: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  toggleFaq(index: number) {
    this.faqs[index].open = !this.faqs[index].open;
  }

  enviarMensagem() {
    if (this.supportForm.valid) {
      alert('Mensagem enviada com sucesso!');
      this.supportForm.reset();
    }
  }
}
