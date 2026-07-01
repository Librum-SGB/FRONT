import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ToastService } from '../../shared/services/toast.service';
import { IMaskDirective } from 'angular-imask';
import { MaskConstants } from '../../enum/const';

@Component({
  selector: 'app-cadastrar-material',
  imports: [FormsModule, CommonModule, IMaskDirective, ReactiveFormsModule],
  templateUrl: './cadastrar-material.html',
  styleUrl: './cadastrar-material.scss',
})
export class CadastrarMaterial implements OnInit {
  enviado: boolean = false;
  salvarLivro() {
    if (this.formLivro.valid) {
      this.limpar();
      this.toastService.sucesso('Livro salvo');
      return;
    }
    this.enviado = true;
    this.gerarMensagensErro();
  }

  isInvalidLivro(campo: string): boolean {
    const control = this.formLivro.get(campo);
    return (control?.invalid && this.enviado) ?? false;
  }

  tipoMaterial: string = 'livro';
  protected readonly Mask = MaskConstants;

  protected formLivro!: FormGroup;
  protected formPeriodico!: FormGroup;
  protected formOutros!: FormGroup;
  mensagensErro: string[] = [];

  // PERIÓDICO
  tituloPeriodico = '';
  editor = '';
  edicaoVolumeNumero = '';
  dataPublicacao = '';
  issn = '';
  tema = '';
  descricaoPeriodico = '';
  quantidadeExemplaresPeriodico = '';
  localizacaoPeriodico = '';
  unidadePeriodico = '';

  // OUTROS MATERIAIS
  nomeMaterial = '';
  tipoOutroMaterial = '';
  autorMaterial = '';
  descricaoMaterial = '';
  quantidadeMaterial = '';
  localizacaoMaterial = '';
  unidadeMaterial = '';
  observacao = '';

  constructor(
    private toastService: ToastService,
    private fb: FormBuilder,
  ) {}
  ngOnInit(): void {
    const hoje = new Date().toISOString().split('T')[0];

    this.formLivro = this.fb.group({
      id: [{ value: '', disabled: true }],
      titulo: ['', Validators.required],
      subtitulo: [''],
      autor: ['', Validators.required],
      editora: ['', Validators.required],
      anoPublicacao: [new Date().getFullYear, Validators.required],
      isbn: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(17)]],
      edicao: [''],
      genero: [''],
      qtdExemplar: [1, [Validators.required, Validators.min(1)]],
      sinopse: [''],
      localizacaoEstante: [''],
      unidade: ['', Validators.required],
      dataAquisicao: [hoje],
    });
  }

  selecionarTipo(tipo: string) {
    this.limpar();
    this.tipoMaterial = tipo;
  }

  salvar() {
    switch (this.tipoMaterial) {
      case 'livro':
        this.salvarLivro();
        break;

      case 'periodico':
        this.salvarPeriodico();
        break;

      case 'outros':
        this.salvarOutro();
        break;
    }
  }
  salvarOutro() {
    throw new Error('Method not implemented.');
  }
  salvarPeriodico() {
    throw new Error('Method not implemented.');
  }
  limpar() {
    this.enviado = false;
    this.mensagensErro.pop();
    this.formLivro.reset();
  }

  gerarMensagensErro(): void {
    this.mensagensErro = [];
    let possuiRequired = false;

    Object.keys(this.formLivro.controls).forEach((campo) => {
      const control = this.formLivro.get(campo);

      if (!control?.errors) {
        return;
      }

      if (control.hasError('required')) {
        possuiRequired = true;
      }

      const nome = this.nomesCamposLivro[campo] ?? campo;

      if (control.hasError('minlength')) {
        const erro = control.getError('minlength');
        this.mensagensErro.push(
          `${nome} deve possuir no mínimo ${erro.requiredLength} caracteres.`,
        );
      }

      if (control.hasError('maxlength')) {
        const erro = control.getError('maxlength');
        this.mensagensErro.push(
          `${nome} deve possuir no máximo ${erro.requiredLength} caracteres.`,
        );
      }

      if (control.hasError('min')) {
        const erro = control.getError('min');
        this.mensagensErro.push(`${nome} deve ser maior ou igual a ${erro.min}.`);
      }

      if (control.hasError('max')) {
        const erro = control.getError('max');
        this.mensagensErro.push(`${nome} deve ser menor ou igual a ${erro.max}.`);
      }

      if (control.hasError('pattern')) {
        this.mensagensErro.push(`${nome} possui um formato inválido.`);
      }
    });

    if (possuiRequired) {
      this.mensagensErro.push('Preencha todos os campos obrigatórios.');
    }
  }
  private readonly nomesCamposLivro: Record<string, string> = {
    titulo: 'Título',
    subtitulo: 'Subtítulo',
    autor: 'Autor',
    editora: 'Editora',
    anoPublicacao: 'Ano de Publicação',
    isbn: 'ISBN',
    edicao: 'Edição',
    genero: 'Gênero',
    qtdExemplar: 'Quantidade de Exemplares',
    sinopse: 'Sinopse',
    localizacaoEstante: 'Localização na Estante',
    unidade: 'Unidade',
    dataAquisicao: 'Data de Aquisição',
  };
}
