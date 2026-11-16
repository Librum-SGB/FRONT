import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { MaterialRequest, MaterialResponse } from '../../models/material.model';
import { MaterialService } from '../../services/material';
import { ReferenciasAcervo, ReferenciasAcervoService } from '../../services/referencias-acervo.service';
import { AlertaErros } from '../../shared/component/alerta-erros/alerta-erros';
import { CorpoPadrao } from '../../shared/component/corpo-padrao/corpo-padrao';
import { LbrAviso } from '../../shared/component/lbr-aviso/lbr-aviso';
import { LbrBadge } from '../../shared/component/lbr-badge/lbr-badge';
import { LbrButtom } from '../../shared/component/lbr-buttom/lbr-buttom';
import { LbrTrilha } from '../../shared/component/lbr-trilha/lbr-trilha';
import { SelectPesquisavel } from '../../shared/component/select-pesquisavel/select-pesquisavel';
import { LbrVoltar } from '../../shared/directives/lbr-voltar';
import { NavegacaoService } from '../../shared/services/navegacao.service';
import { ToastService } from '../../shared/services/toast.service';
import { Formulario, numeroOuNada, textoOuNada } from '../../utils/formulario';
import { mensagemDeCarregamento, mensagemDeErro } from '../../utils/http.util';
import { MaterialExibicao, paraMaterialExibicao } from '../../utils/material.util';
import { idDaRota, ROTAS } from '../../utils/rotas';

type TipoMaterial = 'LIVRO' | 'PERIODICO' | 'OUTRO';

const SEM_REFERENCIAS: ReferenciasAcervo = { autores: [], editoras: [], generos: [] };

@Component({
  selector: 'app-edicao-material',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    CorpoPadrao,
    LbrAviso,
    LbrButtom,
    LbrBadge,
    AlertaErros,
    SelectPesquisavel,
    LbrVoltar,
    LbrTrilha,
  ],
  templateUrl: './edicao-material.html',
})
export class EdicaoMaterial extends Formulario implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly materialService = inject(MaterialService);
  private readonly referenciasService = inject(ReferenciasAcervoService);
  private readonly navegacao = inject(NavegacaoService);

  protected readonly rotaMateriais = ROTAS.materiais;
  readonly anoAtual = new Date().getFullYear();
  readonly id = idDaRota(this.route);

  private readonly materialOriginal = signal<MaterialResponse | null>(null);
  readonly referencias = signal<ReferenciasAcervo>(SEM_REFERENCIAS);
  readonly carregando = signal(true);
  readonly erroCarregamento = signal('');
  readonly salvando = signal(false);

  /** Material atual (com nomes resolvidos), usado no topo da tela. */
  readonly material = computed<MaterialExibicao | null>(() => {
    const original = this.materialOriginal();
    return original ? paraMaterialExibicao(original, this.referencias()) : null;
  });

  readonly tipo = computed(() => (this.materialOriginal()?.tipo ?? 'LIVRO') as TipoMaterial);

  // os validadores de cada campo dependem do tipo e são aplicados em aplicarValidadores()
  readonly form = this.fb.group({
    titulo: [''],
    subtitulo: [''],
    // ids como número: é assim que o select-pesquisavel compara as opções
    autorId: [null as number | null],
    editoraId: [null as number | null],
    anoPublicacao: [null as number | null],
    isbn: [''],
    issn: [''],
    edicao: [null as number | null],
    quantidadePaginas: [null as number | null, Validators.min(1)],
    generoIds: [[] as number[]],
    sinopse: [''],
    tema: [''],
    descricao: [''],
    observacao: [''],
  });

  /** Os nomes mudam conforme o tipo (ex.: "Nome" em vez de "Título" para Outros Materiais). */
  protected get nomesCampos(): Record<string, string> {
    const outro = this.tipo() === 'OUTRO';
    return {
      titulo: outro ? 'Nome' : 'Título',
      subtitulo: 'Subtítulo',
      autorId: 'Autor',
      editoraId: 'Editora',
      anoPublicacao: 'Ano de publicação',
      isbn: 'ISBN',
      issn: 'ISSN',
      edicao: this.tipo() === 'PERIODICO' ? 'Edição/Número' : 'Edição',
      quantidadePaginas: 'Quantidade de páginas',
      tema: outro ? 'Tipo' : 'Tema',
    };
  }

  ngOnInit(): void {
    if (this.id === null) {
      this.erroCarregamento.set('Material não encontrado.');
      this.carregando.set(false);
      return;
    }

    forkJoin({
      material: this.materialService.findById(this.id),
      referencias: this.referenciasService.carregar(),
    }).subscribe({
      next: ({ material, referencias }) => {
        this.referencias.set(referencias);
        this.materialOriginal.set(material);
        this.aplicarValidadores(material.tipo);
        this.preencherFormulario(material);
        this.carregando.set(false);
      },
      error: (erro) => {
        this.erroCarregamento.set(
          mensagemDeCarregamento(erro, 'Material não encontrado.', 'Não foi possível carregar o material.'),
        );
        this.carregando.set(false);
      },
    });
  }

  private aplicarValidadores(tipo: string): void {
    const req = Validators.required;
    const ano = [req, Validators.min(1000), Validators.max(this.anoAtual)];

    const regras: Record<string, Record<string, ValidatorFn[]>> = {
      LIVRO: {
        titulo: [req],
        autorId: [req],
        editoraId: [req],
        anoPublicacao: ano,
        isbn: [req, Validators.minLength(10), Validators.maxLength(17)],
      },
      PERIODICO: {
        titulo: [req],
        editoraId: [req],
        edicao: [req, Validators.min(1)],
        anoPublicacao: ano,
        issn: [req],
      },
      OUTRO: {
        titulo: [req],
        tema: [req],
      },
    };

    for (const campo of ['titulo', 'autorId', 'editoraId', 'anoPublicacao', 'isbn', 'issn', 'edicao', 'tema']) {
      const control = this.form.get(campo)!;
      control.setValidators(regras[tipo]?.[campo] ?? []);
      control.updateValueAndValidity({ emitEvent: false });
    }
  }

  private preencherFormulario(m: MaterialResponse): void {
    this.form.reset({
      titulo: m.titulo ?? '',
      subtitulo: m.subtitulo ?? '',
      autorId: m.autorId ?? null,
      editoraId: m.editoraId ?? null,
      anoPublicacao: m.anoPublicacao ?? null,
      isbn: m.isbn ?? '',
      issn: m.issn ?? '',
      edicao: m.edicao ?? null,
      quantidadePaginas: m.quantidadePaginas ?? null,
      generoIds: [...(m.generoIds ?? [])],
      sinopse: m.sinopse ?? '',
      tema: m.tema ?? '',
      descricao: m.descricao ?? '',
      observacao: m.observacao ?? '',
    });
  }

  salvar(): void {
    if (this.id === null || !this.materialOriginal() || this.salvando()) return;
    if (!this.validar()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const v = this.form.getRawValue();
    const tipo = this.tipo();

    // Envia todos os campos (os que não aparecem para o tipo mantêm o valor carregado),
    // para que o PUT não apague dados já gravados.
    const payload: MaterialRequest = {
      tipo,
      titulo: String(v.titulo).trim(),
      subtitulo: textoOuNada(v.subtitulo),
      autorId: numeroOuNada(v.autorId),
      editoraId: numeroOuNada(v.editoraId),
      anoPublicacao: numeroOuNada(v.anoPublicacao),
      isbn: textoOuNada(v.isbn),
      issn: textoOuNada(v.issn),
      edicao: numeroOuNada(v.edicao),
      quantidadePaginas: numeroOuNada(v.quantidadePaginas),
      sinopse: textoOuNada(v.sinopse),
      tema: textoOuNada(v.tema),
      descricao: textoOuNada(v.descricao),
      observacao: textoOuNada(v.observacao),
      // no livro, manda sempre a lista (mesmo vazia) para remover todos os gêneros funcionar
      generoIds: tipo === 'LIVRO' ? (v.generoIds ?? []) : undefined,
    };

    const id = this.id;
    this.salvando.set(true);
    this.materialService.update(id, payload).subscribe({
      next: () => {
        this.salvando.set(false);
        this.toast.sucesso('Material atualizado com sucesso!');
        // volta para onde a pessoa estava (detalhe, listagem...)
        this.navegacao.voltar(['/materiais', id]);
      },
      error: (erro) => {
        this.salvando.set(false);
        this.toast.erro(mensagemDeErro(erro, 'Não foi possível salvar as alterações.'));
      },
    });
  }
}
