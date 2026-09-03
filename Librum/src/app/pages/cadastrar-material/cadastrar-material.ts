import { Component, OnInit, ViewChild } from '@angular/core';
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
import { CorpoPadrao } from '../../shared/component/corpo-padrao/corpo-padrao';
import { AutorResponse } from '../../models/autor.model';
import { EditoraResponse } from '../../models/editora.model';
import { GeneroResponse } from '../../models/genero.model';
import { MaterialService } from '../../services/material';
import { AutorService } from '../../services/autor';
import { EditoraService } from '../../services/editora';
import { GeneroService } from '../../services/genero';
import { MaterialRequest } from '../../models/material.model';
import { CadastroAutorModal } from '../../shared/component/cadastro-autor-modal/cadastro-autor-modal';
import { CadastroEditoraModal } from '../../shared/component/cadastro-editora-modal/cadastro-editora-modal';
import { CadastroGeneroModal } from '../../shared/component/cadastro-genero-modal/cadastro-genero-modal';
import { SelectPesquisavel } from '../../shared/component/select-pesquisavel/select-pesquisavel';

@Component({
  selector: 'app-cadastrar-material',
  imports: [
    FormsModule,
    CommonModule,
    IMaskDirective,
    ReactiveFormsModule,
    CorpoPadrao,
    CadastroAutorModal,
    CadastroEditoraModal,
    CadastroGeneroModal,
    SelectPesquisavel,
  ],
  templateUrl: './cadastrar-material.html',
  styleUrl: './cadastrar-material.scss',
})
export class CadastrarMaterial implements OnInit {
  enviado: boolean = false;

  tipoMaterial: string = 'livro';
  protected readonly Mask = MaskConstants;

  protected formLivro!: FormGroup;
  protected formPeriodico!: FormGroup;
  protected formOutros!: FormGroup;
  mensagensErro: string[] = [];

  // Fontes de dados pros selects pesquisáveis (o componente filtra sozinho)
  autores: AutorResponse[] = [];
  editoras: EditoraResponse[] = [];
  generos: GeneroResponse[] = [];
  generoIdsSelecionados: number[] = [];

  mostrarModalAutor = false;
  mostrarModalEditora = false;
  mostrarModalGenero = false;

  // Referências aos selects renderizados no momento (só um de cada tipo existe por vez, por causa do *ngIf)
  @ViewChild('autorSelectLivro') autorSelectLivro?: SelectPesquisavel;
  @ViewChild('autorSelectOutros') autorSelectOutros?: SelectPesquisavel;
  @ViewChild('editoraSelectLivro') editoraSelectLivro?: SelectPesquisavel;
  @ViewChild('editoraSelectPeriodico') editoraSelectPeriodico?: SelectPesquisavel;
  @ViewChild('editoraSelectOutros') editoraSelectOutros?: SelectPesquisavel;
  @ViewChild('generoSelectLivro') generoSelectLivro?: SelectPesquisavel;

  constructor(
    private toastService: ToastService,
    private fb: FormBuilder,
    private materialService: MaterialService,
    private autorService: AutorService,
    private editoraService: EditoraService,
    private generoService: GeneroService,
  ) { }

  ngOnInit(): void {
    const hoje = new Date().toISOString().split('T')[0];
    const anoAtual = new Date().getFullYear();

    this.formLivro = this.fb.group({
      titulo: ['', Validators.required],
      subtitulo: [''],
      autorId: ['', Validators.required],
      editoraId: ['', Validators.required],
      anoPublicacao: [anoAtual, Validators.required],
      isbn: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(17)]],
      edicao: [''],
      quantidadePaginas: [''],
      sinopse: [''],
      dataAquisicao: [hoje],
    });

    this.formPeriodico = this.fb.group({
      titulo: ['', Validators.required],
      editoraId: ['', Validators.required],
      edicao: ['', Validators.required],
      anoPublicacao: [anoAtual, Validators.required],
      issn: ['', Validators.required],
      tema: [''],
      descricao: [''],
    });

    this.formOutros = this.fb.group({
      titulo: ['', Validators.required],
      editoraId: [''],
      autorId: [''],
      tema: ['', Validators.required], // subcategoria, texto livre
      descricao: [''],
      observacao: [''],
    });

    this.generoService.findAll().subscribe({
      next: (data: GeneroResponse[]) => {
        this.generos = [...data].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
      },
      error: (err: any) => console.error('Erro ao carregar gêneros:', err),
    });

    this.autorService.findAll().subscribe({
      next: (data: AutorResponse[]) => {
        this.autores = [...data].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
      },
      error: (err: any) => console.error('Erro ao carregar autores:', err),
    });

    this.editoraService.findAll().subscribe({
      next: (data: EditoraResponse[]) => {
        this.editoras = [...data].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
      },
      error: (err: any) => console.error('Erro ao carregar editoras:', err),
    });
  }

  // ---------- Navegação entre tipos ----------

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

  // ---------- Validação genérica (reaproveitada pelos 3 forms) ----------

  isInvalido(form: FormGroup, campo: string): boolean {
    const control = form.get(campo);
    return (control?.invalid && this.enviado) ?? false;
  }

  private gerarMensagensErro(form: FormGroup, nomesCampos: Record<string, string>): void {
    this.mensagensErro = [];
    let possuiRequired = false;

    Object.keys(form.controls).forEach((campo) => {
      const control = form.get(campo);
      if (!control?.errors) return;

      if (control.hasError('required')) possuiRequired = true;

      const nome = nomesCampos[campo] ?? campo;

      if (control.hasError('minlength')) {
        const erro = control.getError('minlength');
        this.mensagensErro.push(`${nome} deve possuir no mínimo ${erro.requiredLength} caracteres.`);
      }
      if (control.hasError('maxlength')) {
        const erro = control.getError('maxlength');
        this.mensagensErro.push(`${nome} deve possuir no máximo ${erro.requiredLength} caracteres.`);
      }
      if (control.hasError('min')) {
        this.mensagensErro.push(`${nome} deve ser maior ou igual a ${control.getError('min').min}.`);
      }
      if (control.hasError('max')) {
        this.mensagensErro.push(`${nome} deve ser menor ou igual a ${control.getError('max').max}.`);
      }
      if (control.hasError('pattern')) {
        this.mensagensErro.push(`${nome} possui um formato inválido.`);
      }
    });

    if (possuiRequired) {
      this.mensagensErro.push('Preencha todos os campos obrigatórios.');
    }
  }

  // ---------- LIVRO ----------

  salvarLivro() {
    if (!this.formLivro.valid) {
      this.enviado = true;
      this.gerarMensagensErro(this.formLivro, this.nomesCamposLivro);
      return;
    }

    const form = this.formLivro.getRawValue();

    const payload: MaterialRequest = {
      tipo: 'LIVRO',
      titulo: form.titulo,
      subtitulo: form.subtitulo || undefined,
      autorId: Number(form.autorId),
      editoraId: Number(form.editoraId),
      anoPublicacao: form.anoPublicacao ? Number(form.anoPublicacao) : undefined,
      isbn: form.isbn,
      edicao: form.edicao ? Number(form.edicao) : undefined,
      quantidadePaginas: form.quantidadePaginas ? Number(form.quantidadePaginas) : undefined,
      sinopse: form.sinopse || undefined,
      generoIds: this.generoIdsSelecionados.length > 0 ? this.generoIdsSelecionados : undefined,
    };

    this.materialService.create(payload).subscribe({
      next: () => {
        this.limpar();
        this.toastService.sucesso('Livro salvo');
      },
      error: (err) => {
        console.error('Erro ao salvar livro:', err);
        this.toastService.erro('Erro ao salvar livro. Verifique os dados.');
      },
    });
  }

  // ---------- PERIÓDICO ----------

  salvarPeriodico() {
    if (!this.formPeriodico.valid) {
      this.enviado = true;
      this.gerarMensagensErro(this.formPeriodico, this.nomesCamposPeriodico);
      return;
    }

    const form = this.formPeriodico.getRawValue();

    const payload: MaterialRequest = {
      tipo: 'PERIODICO',
      titulo: form.titulo,
      editoraId: Number(form.editoraId),
      edicao: form.edicao ? Number(form.edicao) : undefined,
      anoPublicacao: form.anoPublicacao ? Number(form.anoPublicacao) : undefined,
      issn: form.issn,
      tema: form.tema || undefined,
      descricao: form.descricao || undefined,
    };

    this.materialService.create(payload).subscribe({
      next: () => {
        this.limpar();
        this.toastService.sucesso('Periódico salvo');
      },
      error: (err) => {
        console.error('Erro ao salvar periódico:', err);
        this.toastService.erro('Erro ao salvar periódico. Verifique os dados.');
      },
    });
  }

  // ---------- OUTROS MATERIAIS ----------

  salvarOutro() {
    if (!this.formOutros.valid) {
      this.enviado = true;
      this.gerarMensagensErro(this.formOutros, this.nomesCamposOutros);
      return;
    }

    const form = this.formOutros.getRawValue();

    const payload: MaterialRequest = {
      tipo: 'OUTROS',
      titulo: form.titulo,
      editoraId: form.editoraId ? Number(form.editoraId) : undefined,
      autorId: form.autorId ? Number(form.autorId) : undefined,
      tema: form.tema,
      descricao: form.descricao || undefined,
      observacao: form.observacao || undefined,
    }

    this.materialService.create(payload).subscribe({
      next: () => {
        this.limpar();
        this.toastService.sucesso('Material salvo');
      },
      error: (err) => {
        console.error('Erro ao salvar material:', err);
        this.toastService.erro('Erro ao salvar material. Verifique os dados.');
      },
    });
  }

  // ---------- Limpeza geral ----------

  limpar() {
    this.enviado = false;
    this.mensagensErro = [];
    this.formLivro?.reset({ anoPublicacao: new Date().getFullYear() });
    this.formPeriodico?.reset({ anoPublicacao: new Date().getFullYear() });
    this.formOutros?.reset();
    this.generoIdsSelecionados = [];
  }

  private readonly nomesCamposLivro: Record<string, string> = {
    titulo: 'Título',
    subtitulo: 'Subtítulo',
    autorId: 'Autor',
    editoraId: 'Editora',
    anoPublicacao: 'Ano de Publicação',
    isbn: 'ISBN',
    edicao: 'Edição',
    quantidadePaginas: 'Quantidade de Páginas',
    sinopse: 'Sinopse',
    dataAquisicao: 'Data de Aquisição',
  };

  private readonly nomesCamposPeriodico: Record<string, string> = {
    titulo: 'Título',
    editoraId: 'Editora',
    edicao: 'Edição/Número',
    anoPublicacao: 'Ano de Publicação',
    issn: 'ISSN',
    tema: 'Tema',
    descricao: 'Descrição',
  };

  private readonly nomesCamposOutros: Record<string, string> = {
    titulo: 'Nome',
    editoraId: 'Editora',
    autorId: 'Autor',
    tema: 'Tipo',
    descricao: 'Descrição',
    observacao: 'Observação',
  };

  abrirModalAutor(): void {
    this.mostrarModalAutor = true;
  }

  fecharModalAutor(): void {
    this.mostrarModalAutor = false;
  }

  abrirModalEditora(): void {
    this.mostrarModalEditora = true;
  }

  fecharModalEditora(): void {
    this.mostrarModalEditora = false;
  }

  abrirModalGenero(): void {
    this.mostrarModalGenero = true;
  }

  fecharModalGenero(): void {
    this.mostrarModalGenero = false;
  }

  autorCriado(autor: AutorResponse): void {
    this.autores.push(autor);
    this.autores.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

    if (this.tipoMaterial === 'livro') {
      this.formLivro.get('autorId')?.setValue(autor.id);
      this.autorSelectLivro?.selecionarPorId(autor.id);
    } else if (this.tipoMaterial === 'outros') {
      this.formOutros.get('autorId')?.setValue(autor.id);
      this.autorSelectOutros?.selecionarPorId(autor.id);
    }

    this.fecharModalAutor();
  }

  editoraCriada(editora: EditoraResponse): void {
    this.editoras.push(editora);
    this.editoras.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

    if (this.tipoMaterial === 'livro') {
      this.formLivro.get('editoraId')?.setValue(editora.id);
      this.editoraSelectLivro?.selecionarPorId(editora.id);
    } else if (this.tipoMaterial === 'periodico') {
      this.formPeriodico.get('editoraId')?.setValue(editora.id);
      this.editoraSelectPeriodico?.selecionarPorId(editora.id);
    } else if (this.tipoMaterial === 'outros') {
      this.formOutros.get('editoraId')?.setValue(editora.id);
      this.editoraSelectOutros?.selecionarPorId(editora.id);
    }

    this.fecharModalEditora();
  }

  generoCriado(genero: GeneroResponse): void {
    this.generos.push(genero);
    this.generos.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

    if (!this.generoIdsSelecionados.includes(genero.id)) {
      this.generoIdsSelecionados.push(genero.id);
    }

    this.fecharModalGenero();
  }
}