import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { firstValueFrom } from 'rxjs';
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
import { MaterialService, LivroExterno } from '../../services/material';
import { AutorService } from '../../services/autor';
import { EditoraService } from '../../services/editora';
import { GeneroService } from '../../services/genero';
import { MaterialRequest } from '../../models/material.model';
import { CadastroAutorModal } from '../../shared/component/cadastro-autor-modal/cadastro-autor-modal';
import { CadastroEditoraModal } from '../../shared/component/cadastro-editora-modal/cadastro-editora-modal';
import { CadastroGeneroModal } from '../../shared/component/cadastro-genero-modal/cadastro-genero-modal';
import { SelectPesquisavel } from '../../shared/component/select-pesquisavel/select-pesquisavel';
import { LbrButtom } from '../../shared/component/lbr-buttom/lbr-buttom';
import { FormUtils } from '../../utils/FormUtil';
import { AlertaErros } from '../../shared/component/alerta-erros/alerta-erros';

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
    LbrButtom,
    AlertaErros,
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
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const hoje = new Date().toISOString().split('T')[0];

    this.formLivro = this.fb.group({
      titulo: ['', Validators.required],
      subtitulo: [''],
      autorId: ['', Validators.required],
      editoraId: ['', Validators.required],
      anoPublicacao: ['', Validators.required],
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
      anoPublicacao: ['', Validators.required],
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

  // ---------- usado pelo template ----------
  isInvalido(form: FormGroup, campo: string): boolean {
    return FormUtils.isInvalido(form, campo, this.enviado);
  }

  private validar(form: FormGroup, nomes: Record<string, string>): boolean {
    this.enviado = true;
    this.mensagensErro = FormUtils.gerarMensagensErro(form, nomes);
    return form.valid;
  }
  // ---------- LIVRO ----------

  salvarLivro() {
    if (!this.validar(this.formLivro, this.nomesCamposLivro)) return;

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
    if (!this.validar(this.formLivro, this.nomesCamposLivro)) return;

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
    if (!this.validar(this.formLivro, this.nomesCamposLivro)) return;

    const form = this.formOutros.getRawValue();

    const payload: MaterialRequest = {
      tipo: 'OUTRO',
      titulo: form.titulo,
      editoraId: form.editoraId ? Number(form.editoraId) : undefined,
      autorId: form.autorId ? Number(form.autorId) : undefined,
      tema: form.tema,
      descricao: form.descricao || undefined,
      observacao: form.observacao || undefined,
    };

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

  // ---------- Auto-preenchimento por ISBN ----------

  consultandoIsbn = false;
  private ultimoIsbnConsultado = '';

  private normalizar(texto: string): string {
    return (texto ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  private achar<T extends { id: number; nome: string }>(lista: T[], nome?: string): T | undefined {
    if (!nome) return undefined;
    const alvo = this.normalizar(nome);
    return lista.find((i) => this.normalizar(i.nome) === alvo);
  }

  consultarIsbn(): void {
    const ctrl = this.formLivro.get('isbn');
    const bruto = String(ctrl?.value ?? '').trim();
    if (!bruto) return;
    const isbn = bruto.replace(/[\s-]/g, '').toUpperCase();
    const valido = /^\d{9}[\dX]$/.test(isbn) || /^\d{13}$/.test(isbn);
    if (!valido) {
      if (isbn !== this.ultimoIsbnConsultado) {
        this.ultimoIsbnConsultado = isbn;
        this.toastService.aviso('ISBN inválido: use 10 ou 13 dígitos (apenas números; o ISBN-10 pode terminar em X).');
      }
      return;
    }
    if (isbn === this.ultimoIsbnConsultado) return;

    this.ultimoIsbnConsultado = isbn;
    this.consultandoIsbn = true;

    this.materialService.consultarIsbn(isbn).subscribe({
      next: (res) => {
        this.consultandoIsbn = false;
        if (res.jaCadastrado) {
          this.toastService.aviso('Já existe um material cadastrado com este ISBN.');
          return;
        }
        if (!res.encontradoExternamente || !res.livro) {
          this.toastService.info('ISBN não encontrado nas bases externas. Preencha manualmente.');
          return;
        }
        this.preencherPorLivroExterno(res.livro);
      },
      error: (err) => {
        this.consultandoIsbn = false;
        this.ultimoIsbnConsultado = '';
        console.error('Erro ao consultar ISBN:', err);
        this.toastService.erro('Erro ao consultar ISBN.');
      },
    });
  }

  private async preencherPorLivroExterno(livro: LivroExterno): Promise<void> {
    const vazio = (campo: string) => {
      const v = this.formLivro.get(campo)?.value;
      return v === null || v === undefined || v === '';
    };
    const definir = (campo: string, valor: unknown) => {
      if (valor !== null && valor !== undefined && valor !== '' && vazio(campo)) {
        this.formLivro.get(campo)?.setValue(valor);
      }
    };

    definir('titulo', livro.titulo);
    definir('subtitulo', livro.subtitulo);
    definir('anoPublicacao', livro.anoPublicacao);
    definir('quantidadePaginas', livro.quantidadePaginas);
    definir('sinopse', livro.sinopse);

    const criados: string[] = [];
    const falhas: string[] = [];

    const nomeAutor = livro.autores?.[0]?.trim();
    if (nomeAutor && vazio('autorId')) {
      let autor = this.achar(this.autores, nomeAutor);
      if (!autor) {
        try {
          autor = await firstValueFrom(this.autorService.create({ nome: nomeAutor }));
          this.autores = [...this.autores, autor].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
          criados.push(`autor "${autor.nome}"`);
        } catch {
          falhas.push(`autor "${nomeAutor}"`);
        }
      }
      if (autor) {
        this.formLivro.get('autorId')?.setValue(autor.id);
        this.cdr.detectChanges();
        this.autorSelectLivro?.selecionarPorId(autor.id);
      }
    }

    const nomeEditora = livro.editora?.trim();
    if (nomeEditora && vazio('editoraId')) {
      let editora = this.achar(this.editoras, nomeEditora);
      if (!editora) {
        try {
          editora = await firstValueFrom(this.editoraService.create({ nome: nomeEditora }));
          this.editoras = [...this.editoras, editora].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
          criados.push(`editora "${editora.nome}"`);
        } catch {
          falhas.push(`editora "${nomeEditora}"`);
        }
      }
      if (editora) {
        this.formLivro.get('editoraId')?.setValue(editora.id);
        this.cdr.detectChanges();
        this.editoraSelectLivro?.selecionarPorId(editora.id);
      }
    }

    if (this.generoIdsSelecionados.length === 0 && livro.generos?.length) {
      const ids: number[] = [];
      for (const nome of livro.generos.map((g) => g.trim()).filter(Boolean)) {
        let genero = this.achar(this.generos, nome);
        if (!genero) {
          try {
            genero = await firstValueFrom(this.generoService.create({ nome }));
            this.generos = [...this.generos, genero].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
            criados.push(`gênero "${genero.nome}"`);
          } catch {
            falhas.push(`gênero "${nome}"`);
          }
        }
        if (genero && !ids.includes(genero.id)) ids.push(genero.id);
      }
      this.generoIdsSelecionados = ids;
    }
    this.cdr.detectChanges();

    this.toastService.sucesso('Dados preenchidos a partir do ISBN.');
    if (criados.length) {
      this.toastService.info(`Cadastrados automaticamente: ${criados.join(', ')}.`);
    }
    if (falhas.length) {
      this.toastService.aviso(`Não foi possível cadastrar: ${falhas.join(', ')}. Cadastre-os manualmente.`);
    }
  }

  // ---------- Limpeza geral ----------

  limpar() {
    this.ultimoIsbnConsultado = '';
    this.enviado = false;
    this.mensagensErro = [];
    this.formLivro?.reset();
    this.formPeriodico?.reset();
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
