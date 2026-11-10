import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Filial } from '../../models/filial.model';
import { FilialService } from '../../services/filial.service';
import { UsuarioCadastro, UsuarioService } from '../../services/usuario.service';
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
  readonly hoje = this.dataISO(new Date());

  formUsuario!: FormGroup;
  enviado = false;
  mensagensErro: string[] = [];
  filiais: Filial[] = [];
  carregandoFiliais = true;
  salvando = false;
  erroFiliais = '';

  private nomesCampos: Record<string, string> = {
    nome: 'Nome Completo',
    dataNascimento: 'Data de Nascimento',
    cpf: 'CPF',
    filialId: 'Filial',
    telefone: 'Telefone',
    email: 'E-mail',
    senha: 'Senha',
    confirmarSenha: 'Confirmar Senha',
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastService: ToastService,
    private readonly usuarioService: UsuarioService,
    private readonly filialService: FilialService,
  ) {}

  ngOnInit() {
    this.formUsuario = this.fb.group({
      nome: ['', Validators.required],
      dataNascimento: ['', FormUtils.dataPassada],
      cpf: ['', FormUtils.cpf],
      filialId: ['', Validators.required],
      endereco: [''],
      numero: [''],
      bairro: [''],
      cidade: [''],
      estado: [''],
      cep: [''],
      telefone: [''],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      confirmarSenha: ['', [Validators.required, FormUtils.igualA('senha')]],
    });

    this.formUsuario
      .get('senha')!
      .valueChanges.subscribe(() =>
        this.formUsuario.get('confirmarSenha')!.updateValueAndValidity(),
      );
    this.carregarFiliais();
  }

  isInvalido(campo: string): boolean {
    return FormUtils.isInvalido(this.formUsuario, campo, this.enviado);
  }

  carregarFiliais(): void {
    this.carregandoFiliais = true;
    this.erroFiliais = '';
    this.filialService.listarAtivas().subscribe({
      next: (filiais) => {
        this.filiais = filiais.filter((filial) => filial.ativo && filial.id != null);
        this.carregandoFiliais = false;
        if (this.filiais.length === 1) {
          this.formUsuario.patchValue({ filialId: this.filiais[0].id });
        }
      },
      error: (error) => {
        this.erroFiliais = error.error?.message ?? 'Não foi possível carregar as filiais.';
        this.carregandoFiliais = false;
      },
    });
  }

  salvar(): void {
    this.enviado = true;
    this.mensagensErro = FormUtils.gerarMensagensErro(this.formUsuario, this.nomesCampos);

    if (this.formUsuario.invalid || this.salvando || this.carregandoFiliais || this.erroFiliais) {
      this.formUsuario.markAllAsTouched();
      return;
    }

    const {
      confirmarSenha,
      filialId,
      cpf,
      telefone,
      ...dados
    } = this.formUsuario.getRawValue();
    const cadastro: UsuarioCadastro = {
      ...dados,
      nome: dados.nome.trim(),
      email: dados.email.trim().toLocaleLowerCase('pt-BR'),
      senha: dados.senha,
      filialId: Number(filialId),
      cpf: cpf ? String(cpf).replace(/\D/g, '') : undefined,
      telefone: telefone ? String(telefone).replace(/\D/g, '') : undefined,
      dataNascimento: dados.dataNascimento || undefined,
      endereco: dados.endereco?.trim() || undefined,
      numero: dados.numero?.trim() || undefined,
      bairro: dados.bairro?.trim() || undefined,
      cidade: dados.cidade?.trim() || undefined,
      estado: dados.estado?.trim() || undefined,
      cep: dados.cep ? String(dados.cep).replace(/\D/g, '') : undefined,
    };

    this.salvando = true;
    this.usuarioService.cadastrar(cadastro).subscribe({
      next: () => {
        this.toastService.sucesso('Usuário cadastrado com sucesso!');
        this.salvando = false;
        this.router.navigate(['/editar-excluir-usuario']);
      },
      error: (error) => {
        this.salvando = false;
        const mensagem = error.error?.message ?? 'Não foi possível cadastrar o usuário.';
        this.mensagensErro = [mensagem];
        this.toastService.erro(mensagem);
      },
    });
  }

  cancelar(): void {
    this.toastService.aviso('Cadastro de usuário cancelado.');
    this.router.navigate(['/dashboard']);
  }

  private dataISO(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }
}
