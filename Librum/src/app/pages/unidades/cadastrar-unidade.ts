import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IMaskDirective } from 'angular-imask';
import { finalize } from 'rxjs';
import { MaskConstants } from '../../enum/const';
import { FilialRequest } from '../../models/filial.model';
import { FilialService } from '../../services/filial.service';
import { AlertaErros } from '../../shared/component/alerta-erros/alerta-erros';
import { CorpoPadrao } from '../../shared/component/corpo-padrao/corpo-padrao';
import { LbrButtom } from '../../shared/component/lbr-buttom/lbr-buttom';
import { LbrTrilha } from '../../shared/component/lbr-trilha/lbr-trilha';
import { ToastService } from '../../shared/services/toast.service';
import { FormUtils } from '../../utils/FormUtil';

@Component({
  selector: 'app-cadastrar-unidade',
  imports: [ReactiveFormsModule, IMaskDirective, AlertaErros, CorpoPadrao, LbrButtom, LbrTrilha],
  templateUrl: './cadastrar-unidade.html',
})
export class CadastrarUnidade {
  private readonly fb = inject(FormBuilder);
  private readonly filialService = inject(FilialService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly Mask = MaskConstants;
  protected readonly mascaraTelefone = { mask: [MaskConstants.TELEFONE, MaskConstants.CELULAR] };
  readonly estados = [
    'AC',
    'AL',
    'AP',
    'AM',
    'BA',
    'CE',
    'DF',
    'ES',
    'GO',
    'MA',
    'MT',
    'MS',
    'MG',
    'PA',
    'PB',
    'PR',
    'PE',
    'PI',
    'RJ',
    'RN',
    'RS',
    'RO',
    'RR',
    'SC',
    'SP',
    'SE',
    'TO',
  ];
  readonly salvando = signal(false);
  readonly mensagensErro = signal<string[]>([]);
  enviado = false;
  readonly form = this.fb.nonNullable.group({
    nomeFantasia: ['', [Validators.required, Validators.maxLength(150)]],
    razaoSocial: ['', [Validators.required, Validators.maxLength(150)]],
    cnpj: ['', [Validators.required, Validators.pattern(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/)]],
    inscricaoEstadual: ['', Validators.maxLength(20)],
    endereco: ['', [Validators.required, Validators.maxLength(200)]],
    numero: ['', Validators.maxLength(10)],
    complemento: ['', Validators.maxLength(100)],
    bairro: ['', [Validators.required, Validators.maxLength(100)]],
    cidade: ['', [Validators.required, Validators.maxLength(100)]],
    estado: [
      '',
      [
        Validators.required,
        Validators.pattern(
          /^(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)$/,
        ),
      ],
    ],
    cep: ['', [Validators.required, Validators.pattern(/^\d{5}-\d{3}$/)]],
    telefone: ['', Validators.pattern(/^\(\d{2}\) \d{4,5}-\d{4}$/)],
    email: ['', [Validators.email, Validators.maxLength(100)]],
    horarioFuncionamento: ['', Validators.maxLength(255)],
    ativo: [true],
  });
  private readonly nomesCampos: Record<string, string> = {
    nomeFantasia: 'Nome fantasia',
    razaoSocial: 'Razão social',
    cnpj: 'CNPJ',
    inscricaoEstadual: 'Inscrição estadual',
    endereco: 'Endereço',
    numero: 'Número',
    complemento: 'Complemento',
    bairro: 'Bairro',
    cidade: 'Cidade',
    estado: 'Estado',
    cep: 'CEP',
    telefone: 'Telefone',
    email: 'E-mail',
    horarioFuncionamento: 'Horário de funcionamento',
  };

  isInvalido(campo: string): boolean {
    return FormUtils.isInvalido(this.form, campo, this.enviado);
  }

  salvar(): void {
    if (this.salvando()) return;
    for (const campo of Object.keys(this.nomesCampos)) {
      const control = this.form.get(campo);
      if (control && typeof control.value === 'string') control.setValue(control.value.trim());
    }
    this.enviado = true;
    this.form.markAllAsTouched();
    this.mensagensErro.set(FormUtils.gerarMensagensErro(this.form, this.nomesCampos));
    if (this.form.invalid) return;

    const dados = this.form.getRawValue();
    const payload: FilialRequest = {
      ...dados,
      cnpj: dados.cnpj.replace(/\D/g, ''),
      cep: dados.cep.replace(/\D/g, ''),
      telefone: dados.telefone.replace(/\D/g, '') || undefined,
      inscricaoEstadual: dados.inscricaoEstadual || undefined,
      numero: dados.numero || undefined,
      complemento: dados.complemento || undefined,
      email: dados.email || undefined,
      horarioFuncionamento: dados.horarioFuncionamento || undefined,
    };
    this.salvando.set(true);
    this.filialService
      .criar(payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.salvando.set(false)),
      )
      .subscribe({
        next: () => {
          this.toast.sucesso('Unidade cadastrada com sucesso!');
          this.router.navigate(['/unidades']);
        },
        error: (erro: HttpErrorResponse) => {
          const mensagem =
            erro.status === 0
              ? 'Não foi possível conectar ao servidor. Tente novamente.'
              : erro.error?.message || 'Não foi possível cadastrar a unidade. Tente novamente.';
          const erros = Object.values(erro.error?.fieldErrors ?? {}).filter(
            (valor): valor is string => typeof valor === 'string',
          );
          this.mensagensErro.set(erros.length ? erros : [mensagem]);
          this.toast.erro(mensagem);
        },
      });
  }

  cancelar(): void {
    if (!this.salvando()) this.router.navigate(['/unidades']);
  }
}
