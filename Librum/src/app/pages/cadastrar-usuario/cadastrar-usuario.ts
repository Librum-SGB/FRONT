import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '../../shared/services/toast.service';
import { MaskConstants } from '../../enum/const';
import { IMaskDirective } from 'angular-imask';
import { CorpoPadrao } from '../../shared/component/corpo-padrao/corpo-padrao';
import { LbrButtom } from '../../shared/component/lbr-buttom/lbr-buttom';
import { FormUtils } from '../../utils/FormUtil';
import { AlertaErros } from '../../shared/component/alerta-erros/alerta-erros';

@Component({
  selector: 'app-cadastrar-usuario',
  imports: [ReactiveFormsModule, IMaskDirective, CorpoPadrao, LbrButtom, AlertaErros],
  templateUrl: './cadastrar-usuario.html',
  styleUrl: './cadastrar-usuario.scss',
})
export class CadastrarUsuario implements OnInit {
  protected readonly Mask = MaskConstants;

  formUsuario!: FormGroup;
  enviado = false;
  mensagensErro: string[] = [];
  foto?: File;

  private nomesCampos: Record<string, string> = {
    nome: 'Nome Completo',
    dataNascimento: 'Data de Nascimento',
    cpf: 'CPF',
    endereco: 'Endereço',
    telefone: 'Telefone',
    email: 'E-mail',
    tipoCliente: 'Tipo de Cliente',
    senha: 'Senha',
    confirmarSenha: 'Confirmar Senha',
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastService: ToastService,
  ) {}

  ngOnInit() {
    this.formUsuario = this.fb.group({
      id: [{ value: this.gerarId(), disabled: true }],
      dataCadastro: [{ value: new Date().toLocaleDateString('pt-BR'), disabled: true }],
      status: [{ value: 'Ativo', disabled: true }],

      nome: ['', Validators.required],
      dataNascimento: ['', [Validators.required, FormUtils.dataPassada]],
      cpf: ['', [Validators.required, FormUtils.cpf]],
      endereco: ['', Validators.required],
      telefone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      tipoCliente: ['', Validators.required],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      confirmarSenha: ['', [Validators.required, FormUtils.igualA('senha')]],
      observacao: [''],
    });

    // Se a senha mudar depois, revalida a confirmação
    this.formUsuario
      .get('senha')!
      .valueChanges.subscribe(() =>
        this.formUsuario.get('confirmarSenha')!.updateValueAndValidity(),
      );
  }

  isInvalido(campo: string): boolean {
    return FormUtils.isInvalido(this.formUsuario, campo, this.enviado);
  }

  private gerarId(): string {
    return 'USR-' + Math.floor(1000 + Math.random() * 9000);
  }

  onFileSelect(event: Event) {
    this.foto = (event.target as HTMLInputElement).files?.[0];
  }

  salvar() {
    this.enviado = true;
    this.mensagensErro = FormUtils.gerarMensagensErro(this.formUsuario, this.nomesCampos);

    if (this.formUsuario.invalid) return;

    const { confirmarSenha, ...dados } = this.formUsuario.getRawValue();
    // ...chamar service com { ...dados, foto: this.foto }

    this.toastService.sucesso('Usuário cadastrado com sucesso!');
    this.router.navigate(['/dashboard']);
  }

  cancelar() {
    this.toastService.aviso('Cadastro de usuário cancelado.');
    this.router.navigate(['/dashboard']);
  }
}
