import { Component, OnInit } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

import { TipoRelatorio } from '../../enum/tipo-relatorio.enum';
import { ToastService } from '../../shared/services/toast.service';
import { CorpoPadrao } from '../../shared/component/corpo-padrao/corpo-padrao';
import { LbrButtom } from '../../shared/component/lbr-buttom/lbr-buttom';
import { AlertaErros } from '../../shared/component/alerta-erros/alerta-erros';
import { FormUtils } from '../../utils/FormUtil';
import { SelectPesquisavel } from '../../shared/component/select-pesquisavel/select-pesquisavel';

@Component({
  selector: 'app-relatorio',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CorpoPadrao,
    LbrButtom,
    AlertaErros,
    SelectPesquisavel,
  ],
  templateUrl: './relatorio.html',
  styleUrl: './relatorio.scss',
})
export class Relatorio implements OnInit {
  constructor(
    private toastService: ToastService,
    private fb: FormBuilder,
  ) {}

  formRelatorio!: FormGroup;

  enviado = false;
  mensagensErro: string[] = [];

  tiposRelatorio = [
    { id: TipoRelatorio.Usuario, nome: 'Usuário' },
    { id: TipoRelatorio.Emprestimo, nome: 'Empréstimo' },
    { id: TipoRelatorio.Acervo, nome: 'Acervo' },
    { id: TipoRelatorio.Bloqueio, nome: 'Bloqueio' },
    { id: TipoRelatorio.Devolucao, nome: 'Devoluções' },
    { id: TipoRelatorio.Reservas, nome: 'Reservas' },
    { id: TipoRelatorio.Penalidades, nome: 'Penalidades' },
    { id: TipoRelatorio.Estatisticas, nome: 'Estatísticas' },
  ];

  tiposSelecionados: number[] = [];

  private readonly nomesCampos: Record<string, string> = {
    dataInicio: 'Data inicial',
    dataFim: 'Data final',
  };

  ngOnInit(): void {
    this.formRelatorio = this.fb.group({
      dataInicio: ['', Validators.required],
      dataFim: ['', Validators.required],
    });
  }

  isInvalido(form: FormGroup, campo: string): boolean {
    return FormUtils.isInvalido(form, campo, this.enviado);
  }

  gerarRelatorio(): void {
    this.enviado = true;
    this.mensagensErro = [];

    this.mensagensErro = FormUtils.gerarMensagensErro(this.formRelatorio, this.nomesCampos);

    if (this.tiposSelecionados.length === 0) {
      this.mensagensErro.push('Selecione pelo menos um tipo de dado para gerar o relatório.');
    }

    const { dataInicio, dataFim } = this.formRelatorio.getRawValue();

    if (dataInicio && dataFim && dataFim < dataInicio) {
      this.mensagensErro.push('A data final deve ser igual ou posterior à data inicial.');
    }

    if (
      this.formRelatorio.invalid ||
      this.tiposSelecionados.length === 0 ||
      (dataInicio && dataFim && dataFim < dataInicio)
    ) {
      return;
    }

    const filtros = {
      ...this.formRelatorio.getRawValue(),
      tiposSelecionados: this.tiposSelecionados,
    };

    console.log('Filtros do relatório:', filtros);

    this.toastService.sucesso('Relatório gerado');
  }

  limpar(): void {
    this.enviado = false;
    this.mensagensErro = [];
    this.tiposSelecionados = [];

    this.formRelatorio.reset({
      dataInicio: '',
      dataFim: '',
    });
  }
}
