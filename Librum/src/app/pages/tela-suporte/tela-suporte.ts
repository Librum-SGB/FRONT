import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../shared/services/toast.service';
import { CorpoPadrao } from '../../shared/component/corpo-padrao/corpo-padrao';
import { FormUtils } from '../../utils/FormUtil';
import { AlertaErros } from '../../shared/component/alerta-erros/alerta-erros';

@Component({
  selector: 'app-tela-suporte',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CorpoPadrao, AlertaErros],
  templateUrl: './tela-suporte.html',
  styleUrls: ['./tela-suporte.scss'],
})
export class TelaSuporte implements OnInit {
  supportForm!: FormGroup;
  enviado = false;
  mensagensErro: string[] = [];

  private readonly nomesCampos: Record<string, string> = {
    assunto: 'Assunto',
    mensagem: 'Mensagem',
  };

  faqs = [
    {
      question: 'Como cadastrar um novo livro?',
      answer: 'Vá no menu Cadastrar Material e preencha os dados.',
      open: false,
    },
    {
      question: 'Como renovar um empréstimo?',
      answer: 'Acesse Empréstimos Ativos e clique em renovar.',
      open: false,
    },
    {
      question: 'Usuário bloqueado, o que fazer?',
      answer: 'Regularize as pendências no perfil do usuário.',
      open: false,
    },
  ];

  constructor(
    private fb: FormBuilder,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.supportForm = this.fb.group({
      assunto: ['', Validators.required],
      mensagem: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  toggleFaq(index: number) {
    this.faqs[index].open = !this.faqs[index].open;
  }

  isInvalido(campo: string): boolean {
    return FormUtils.isInvalido(this.supportForm, campo, this.enviado);
  }

  enviarMensagem() {
    this.enviado = true;
    this.mensagensErro = FormUtils.gerarMensagensErro(this.supportForm, this.nomesCampos);

    if (this.supportForm.invalid) return;

    this.toastService.sucesso('Mensagem enviada com sucesso!');
    this.supportForm.reset({ assunto: '', mensagem: '' });
    this.enviado = false;
    this.mensagensErro = [];
  }
}
