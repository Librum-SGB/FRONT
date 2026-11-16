import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs';

import { MaterialResponse } from '../../models/material.model';
import { AutorService } from '../../services/autor';
import { EditoraService } from '../../services/editora';
import { GeneroService } from '../../services/genero';
import { CampoFiltro, opcoesDosItens } from '../../shared/component/lbr-filtros/filtros';
import { ValorOrdenacao } from '../../shared/component/lbr-tabela/lbr-tabela';
import { ConfirmacaoService } from '../../shared/services/confirmacao.service';
import { ToastService } from '../../shared/services/toast.service';
import { formatarDataBR } from '../../utils/data.util';
import { mensagemDeErro } from '../../utils/http.util';

/**
 * Cadastros auxiliares do acervo (autor, editora e gênero). Todos têm o mesmo formato
 * — um nome, alguns campos e materiais vinculados —, então usam as mesmas três telas
 * (listagem, detalhe e formulário), cada uma lendo a configuração do cadastro da rota.
 */
export type TipoCadastroAcervo = 'autor' | 'editora' | 'genero';

export interface RegistroAcervo {
  id: number;
  nome: string;
  dataCriacao?: string;
  dataUltimaAtualizacao?: string;
  [campo: string]: unknown;
}

export interface CampoCadastro {
  chave: string;
  rotulo: string;
  tipo: 'texto' | 'data' | 'textoLongo';
  obrigatorio?: boolean;
  maxLength?: number;
  /** Ocupa a linha inteira (padrão para textoLongo) ou metade. */
  larguraInteira?: boolean;
}

export interface ColunaCadastro {
  rotulo: string;
  valor: (registro: RegistroAcervo) => string;
  ordenar: ValorOrdenacao<RegistroAcervo>;
}

export interface ConfigCadastroAcervo {
  tipo: TipoCadastroAcervo;
  singular: string;
  plural: string;
  /** Para as mensagens: "Autor excluído" / "Editora excluída". */
  feminino: boolean;
  icone: string;
  rotaLista: string;
  /** Chave do filtro na listagem de materiais (ex.: /editarExcluirMaterial?autor=3). */
  filtroMaterial: string;
  pertenceAoMaterial: (material: MaterialResponse, id: number) => boolean;
  campos: CampoCadastro[];
  colunas: ColunaCadastro[];
  filtros: (registros: RegistroAcervo[]) => CampoFiltro<RegistroAcervo>[];
  listar: () => Observable<RegistroAcervo[]>;
  buscar: (id: number) => Observable<RegistroAcervo>;
  criar: (dados: Record<string, unknown>) => Observable<RegistroAcervo>;
  atualizar: (id: number, dados: Record<string, unknown>) => Observable<RegistroAcervo>;
  excluir: (id: number) => Observable<void>;
}

const texto = (valor: unknown) => (valor == null || valor === '' ? '—' : String(valor));

/** Filtro de nacionalidade montado a partir dos próprios registros. */
const filtroNacionalidade = (registros: RegistroAcervo[]): CampoFiltro<RegistroAcervo>[] => [
  {
    tipo: 'lista',
    chave: 'nacionalidade',
    rotulo: 'Nacionalidade',
    valorDoItem: (r) => r['nacionalidade'],
    opcoes: opcoesDosItens(registros, (r) => r['nacionalidade'] as string | undefined),
  },
];

@Injectable({ providedIn: 'root' })
export class CadastrosAcervoService {
  private readonly autorService = inject(AutorService);
  private readonly editoraService = inject(EditoraService);
  private readonly generoService = inject(GeneroService);
  private readonly confirmacao = inject(ConfirmacaoService);
  private readonly toast = inject(ToastService);

  private readonly configs: Record<TipoCadastroAcervo, ConfigCadastroAcervo> = {
    autor: {
      tipo: 'autor',
      singular: 'Autor',
      plural: 'Autores',
      feminino: false,
      icone: 'bi-person-lines-fill',
      rotaLista: '/autores',
      filtroMaterial: 'autor',
      pertenceAoMaterial: (m, id) => m.autorId === id || (m.autorIds ?? []).includes(id),
      campos: [
        { chave: 'nome', rotulo: 'Nome', tipo: 'texto', obrigatorio: true, maxLength: 150, larguraInteira: true },
        { chave: 'nacionalidade', rotulo: 'Nacionalidade', tipo: 'texto', maxLength: 100 },
        { chave: 'dataNascimento', rotulo: 'Data de nascimento', tipo: 'data' },
        { chave: 'dataFalecimento', rotulo: 'Data de falecimento', tipo: 'data' },
        { chave: 'biografia', rotulo: 'Biografia', tipo: 'textoLongo' },
      ],
      colunas: [
        { rotulo: 'Nacionalidade', valor: (r) => texto(r['nacionalidade']), ordenar: 'nacionalidade' },
        { rotulo: 'Nascimento', valor: (r) => formatarDataBR(r['dataNascimento'] as string), ordenar: 'dataNascimento' },
      ],
      filtros: filtroNacionalidade,
      listar: () => this.autorService.findAll() as Observable<RegistroAcervo[]>,
      buscar: (id) => this.autorService.findById(id) as Observable<RegistroAcervo>,
      criar: (dados) => this.autorService.create(dados as never) as Observable<RegistroAcervo>,
      atualizar: (id, dados) => this.autorService.update(id, dados as never) as Observable<RegistroAcervo>,
      excluir: (id) => this.autorService.delete(id),
    },
    editora: {
      tipo: 'editora',
      singular: 'Editora',
      plural: 'Editoras',
      feminino: true,
      icone: 'bi-building',
      rotaLista: '/editoras',
      filtroMaterial: 'editora',
      pertenceAoMaterial: (m, id) => m.editoraId === id,
      campos: [
        { chave: 'nome', rotulo: 'Nome', tipo: 'texto', obrigatorio: true, maxLength: 150 },
        { chave: 'nacionalidade', rotulo: 'Nacionalidade', tipo: 'texto', maxLength: 100 },
      ],
      colunas: [{ rotulo: 'Nacionalidade', valor: (r) => texto(r['nacionalidade']), ordenar: 'nacionalidade' }],
      filtros: filtroNacionalidade,
      listar: () => this.editoraService.findAll() as Observable<RegistroAcervo[]>,
      buscar: (id) => this.editoraService.findById(id) as Observable<RegistroAcervo>,
      criar: (dados) => this.editoraService.create(dados as never) as Observable<RegistroAcervo>,
      atualizar: (id, dados) => this.editoraService.update(id, dados as never) as Observable<RegistroAcervo>,
      excluir: (id) => this.editoraService.delete(id),
    },
    genero: {
      tipo: 'genero',
      singular: 'Gênero',
      plural: 'Gêneros',
      feminino: false,
      icone: 'bi-tags',
      rotaLista: '/generos',
      filtroMaterial: 'genero',
      pertenceAoMaterial: (m, id) => (m.generoIds ?? []).includes(id),
      campos: [
        { chave: 'nome', rotulo: 'Nome', tipo: 'texto', obrigatorio: true, maxLength: 100, larguraInteira: true },
        { chave: 'descricao', rotulo: 'Descrição', tipo: 'textoLongo' },
      ],
      colunas: [{ rotulo: 'Descrição', valor: (r) => texto(r['descricao']), ordenar: 'descricao' }],
      filtros: () => [],
      listar: () => this.generoService.findAll() as Observable<RegistroAcervo[]>,
      buscar: (id) => this.generoService.findById(id) as Observable<RegistroAcervo>,
      criar: (dados) => this.generoService.create(dados as never) as Observable<RegistroAcervo>,
      atualizar: (id, dados) => this.generoService.update(id, dados as never) as Observable<RegistroAcervo>,
      excluir: (id) => this.generoService.delete(id),
    },
  };

  /** Configuração do cadastro indicado na rota (`data: { cadastro: 'autor' }`). */
  daRota(rota: ActivatedRouteSnapshot): ConfigCadastroAcervo {
    return this.configs[rota.data['cadastro'] as TipoCadastroAcervo];
  }

  /**
   * Pede confirmação (informando os materiais vinculados) e exclui.
   * `vinculados`: quantos materiais usam o registro, ou `null` se não se sabe.
   */
  async excluir(config: ConfigCadastroAcervo, registro: RegistroAcervo, vinculados: number | null): Promise<boolean> {
    const confirmado = await this.confirmacao.confirmar({
      titulo: `Excluir ${config.singular.toLocaleLowerCase('pt-BR')}`,
      icone: 'bi-trash',
      tom: 'danger',
      detalhes: [
        { rotulo: 'Nome', valor: registro.nome, destaque: true },
        ...(vinculados != null ? [{ rotulo: 'Materiais vinculados', valor: String(vinculados) }] : []),
      ],
      aviso: vinculados ? `Os ${vinculados} materiais continuam no acervo, mas sem este vínculo.` : undefined,
      textoConfirmar: 'Excluir',
    });
    if (!confirmado) return false;

    try {
      await firstValueFrom(config.excluir(registro.id));
      this.toast.sucesso(`${config.singular} "${registro.nome}" ${this.concordar(config, 'excluído', 'excluída')}.`);
      return true;
    } catch (erro) {
      this.toast.erro(mensagemDeErro(erro, 'Não foi possível excluir.'));
      return false;
    }
  }

  /** Filtro que abre a listagem de materiais só com os deste registro (ex.: ?autor=3). */
  filtroDeMateriais(config: ConfigCadastroAcervo, id: number): Record<string, number> {
    return { [config.filtroMaterial]: id };
  }

  /** "Autor excluído" / "Editora excluída". */
  concordar(config: ConfigCadastroAcervo, masculino: string, feminino: string): string {
    return config.feminino ? feminino : masculino;
  }
}
