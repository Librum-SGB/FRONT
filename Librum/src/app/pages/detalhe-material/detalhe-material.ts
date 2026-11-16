import { LbrTrilha } from '../../shared/component/lbr-trilha/lbr-trilha';
import { NavegacaoService } from '../../shared/services/navegacao.service';
import { LbrVoltar } from '../../shared/directives/lbr-voltar';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, forkJoin, Observable, of } from 'rxjs';

import { Permissao } from '../../enum/permissoes.enum';
import { AutorResponse } from '../../models/autor.model';
import { EditoraResponse } from '../../models/editora.model';
import { ExemplarResponse } from '../../models/exemplar.model';
import { GeneroResponse } from '../../models/genero.model';
import { MaterialResponse } from '../../models/material.model';
import { AuthService } from '../../services/auth.service';
import { AutorService } from '../../services/autor';
import { EditoraService } from '../../services/editora';
import { ExemplarService } from '../../services/exemplar';
import { GeneroService } from '../../services/genero';
import { MaterialService } from '../../services/material';
import { CorpoPadrao } from '../../shared/component/corpo-padrao/corpo-padrao';
import { LbrBadge } from '../../shared/component/lbr-badge/lbr-badge';
import { LbrButtom } from '../../shared/component/lbr-buttom/lbr-buttom';
import { LbrAviso } from '../../shared/component/lbr-aviso/lbr-aviso';
import { LbrCabecalhoDetalhe } from '../../shared/component/lbr-cabecalho-detalhe/lbr-cabecalho-detalhe';
import { LbrCartaoRegistro } from '../../shared/component/lbr-cartao-registro/lbr-cartao-registro';
import { ToastService } from '../../shared/services/toast.service';
import { ConfirmacaoService } from '../../shared/services/confirmacao.service';
import { CampoDetalhe, camposPreenchidos } from '../../utils/campos.util';
import {
  iconeTipoMaterial,
  MaterialExibicao,
  materiaisComExemplarDisponivel,
  paraMaterialExibicao,
  STATUS_EXEMPLAR_DISPONIVEL,
} from '../../utils/material.util';
import { ROTAS } from '../../utils/rotas';

export const ROTA_LISTA_MATERIAIS = ROTAS.materiais;

@Component({
  selector: 'app-detalhe-material',
  imports: [
    RouterLink,
    CorpoPadrao,
    LbrButtom,
    LbrBadge,
    LbrVoltar,
    LbrTrilha,
    LbrAviso,
    LbrCabecalhoDetalhe,
    LbrCartaoRegistro,
  ],
  templateUrl: './detalhe-material.html',
  styleUrl: './detalhe-material.scss',
})
export class DetalheMaterial implements OnInit {
  readonly rotaLista = ROTA_LISTA_MATERIAIS;
  protected readonly rotas = ROTAS;

  // ---------- Dados ----------
  readonly materialOriginal = signal<MaterialResponse | null>(null);
  private readonly autores = signal<AutorResponse[]>([]);
  private readonly editoras = signal<EditoraResponse[]>([]);
  private readonly generos = signal<GeneroResponse[]>([]);
  /** `null` enquanto os exemplares não foram carregados (ou se falharem). */
  private readonly exemplares = signal<ExemplarResponse[] | null>(null);

  readonly carregando = signal(true);
  readonly erroCarregamento = signal('');
  readonly excluindo = signal(false);

  readonly material = computed<MaterialExibicao | null>(() => {
    const original = this.materialOriginal();
    if (!original) return null;
    const exemplares = this.exemplares();
    return paraMaterialExibicao(original, {
      autores: this.autores(),
      editoras: this.editoras(),
      generos: this.generos(),
      materiaisDisponiveis: exemplares ? materiaisComExemplarDisponivel(exemplares) : undefined,
    });
  });

  readonly totalExemplares = computed(() => this.exemplares()?.length ?? null);

  readonly exemplaresDisponiveis = computed(
    () =>
      this.exemplares()?.filter((e) => e.status === STATUS_EXEMPLAR_DISPONIVEL).length ?? null,
  );

  readonly campos = computed<CampoDetalhe[]>(() => {
    const m = this.material();
    if (!m) return [];

    const porTipo: Record<string, [string, unknown][]> = {
      LIVRO: [
        ['Autor', m.autorNome],
        ['Editora', m.editoraNome],
        ['Gêneros', m.generoNomes],
        ['Ano de publicação', m.anoPublicacao],
        ['ISBN', m.isbn],
        ['Edição', m.edicao],
        ['Páginas', m.quantidadePaginas],
      ],
      PERIODICO: [
        ['Editora', m.editoraNome],
        ['Edição/Número', m.edicao],
        ['Ano de publicação', m.anoPublicacao],
        ['ISSN', m.issn],
        ['Tema', m.tema],
      ],
      OUTRO: [
        ['Tipo', m.tema],
        ['Autor', m.autorNome],
        ['Editora', m.editoraNome],
      ],
    };

    return camposPreenchidos(porTipo[m.tipo] ?? []);
  });

  readonly textosLongos = computed<CampoDetalhe[]>(() => {
    const m = this.material();
    if (!m) return [];
    return camposPreenchidos([
      ['Sinopse', m.tipo === 'LIVRO' ? m.sinopse : undefined],
      ['Descrição', m.tipo !== 'LIVRO' ? m.descricao : undefined],
      ['Observação', m.tipo === 'OUTRO' ? m.observacao : undefined],
    ]);
  });

  get podeEditar(): boolean {
    return this.authService.temPermissao(Permissao.EDITAR_MATERIAL);
  }

  get podeExcluir(): boolean {
    return this.authService.temPermissao(Permissao.EXCLUIR_MATERIAL);
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService,
    private confirmacao: ConfirmacaoService,
    private authService: AuthService,
    private materialService: MaterialService,
    private autorService: AutorService,
    private editoraService: EditoraService,
    private generoService: GeneroService,
    private exemplarService: ExemplarService,
    private navegacao: NavegacaoService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      this.erroCarregamento.set('Material não encontrado.');
      this.carregando.set(false);
      return;
    }
    this.carregar(id);
  }

  iconeTipo(tipo: string): string {
    return iconeTipoMaterial(tipo);
  }

  private carregar(id: number): void {
    this.carregando.set(true);
    this.erroCarregamento.set('');

    // Autores, editoras e gêneros só resolvem nomes; se falharem, a tela abre mesmo assim.
    forkJoin({
      material: this.materialService.findById(id),
      autores: this.opcional('autores', this.autorService.findAll()),
      editoras: this.opcional('editoras', this.editoraService.findAll()),
      generos: this.opcional('gêneros', this.generoService.findAll()),
    }).subscribe({
      next: ({ material, autores, editoras, generos }) => {
        this.autores.set(autores);
        this.editoras.set(editoras);
        this.generos.set(generos);
        this.materialOriginal.set(material);
        this.navegacao.definirTitulo(material.titulo);
        this.carregando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erro ao carregar material:', err);
        this.erroCarregamento.set(
          err.status === 404
            ? 'Material não encontrado.'
            : (err.error?.message ?? 'Não foi possível carregar o material.'),
        );
        this.carregando.set(false);
      },
    });

    // Se os exemplares falharem, a disponibilidade simplesmente não aparece.
    this.exemplarService.findByMaterial(id).subscribe({
      next: (exemplares) => this.exemplares.set(exemplares),
      error: (err) => console.error('Erro ao carregar exemplares:', err),
    });
  }

  private opcional<T>(origem: string, fonte: Observable<T[]>): Observable<T[]> {
    return fonte.pipe(
      catchError((err) => {
        console.error(`Erro ao carregar ${origem}:`, err);
        return of([] as T[]);
      }),
    );
  }

  // ---------- Exclusão ----------

  async excluir(): Promise<void> {
    const material = this.material();
    if (!material || !this.podeExcluir || this.excluindo()) return;

    const confirmado = await this.confirmacao.confirmar({
      titulo: 'Excluir material',
      icone: 'bi-trash',
      tom: 'danger',
      mensagem: 'Você está excluindo este material do acervo.',
      detalhes: [
        { rotulo: 'Código', valor: material.codigo },
        { rotulo: 'Título', valor: material.titulo, destaque: true },
        { rotulo: 'Tipo', valor: material.tipoLabel },
        ...(this.totalExemplares() != null
          ? [{ rotulo: 'Exemplares', valor: String(this.totalExemplares()) }]
          : []),
      ],
      aviso: 'O material deixa de aparecer no acervo e nas buscas.',
      textoConfirmar: 'Excluir material',
    });
    if (!confirmado) return;

    this.excluindo.set(true);
    this.materialService.delete(material.id).subscribe({
      next: () => {
        this.toastService.sucesso(`Material "${material.titulo}" excluído com sucesso.`);
        this.excluindo.set(false);
        void this.router.navigate([this.rotaLista]);
      },
      error: (err) => {
        console.error('Erro ao excluir material:', err);
        this.excluindo.set(false);
        this.toastService.erro(err.error?.message ?? 'Erro ao excluir o material.');
      },
    });
  }
}
