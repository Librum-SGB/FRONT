import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AutorResponse } from '../../models/autor.model';
import { ExemplarResponse } from '../../models/exemplar.model';
import { MaterialResponse } from '../../models/material.model';
import {
  EstanteRequestDto,
  EstantePrateleiraDto,
  EstanteResponseDto,
  EstanteVirtualDto,
  ExemplarVirtualDto,
  MaterialVirtualDto,
  PrateleiraVirtualDto,
} from '../../dto/estantevirtual.dto';

@Injectable({
  providedIn: 'root',
})
export class EstanteService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getEstantes(): Observable<EstanteVirtualDto[]> {
    return forkJoin({
      estantes: this.http.get<EstanteResponseDto[]>(`${this.apiUrl}/estantes?ativo=true`),
      exemplares: this.http.get<ExemplarResponse[] | null>(`${this.apiUrl}/exemplares`),
      materiais: this.http.get<MaterialResponse[] | null>(`${this.apiUrl}/materiais`),
      autores: this.http.get<AutorResponse[] | null>(`${this.apiUrl}/autores?ativo=true`),
    }).pipe(
      map(({ estantes, exemplares, materiais, autores }) =>
        this.montarEstantes(estantes, exemplares ?? [], materiais ?? [], autores ?? []),
      ),
    );
  }

  criarEstante(estante: EstanteRequestDto): Observable<EstanteResponseDto> {
    return this.http.post<EstanteResponseDto>(`${this.apiUrl}/estantes`, estante);
  }

  atualizarEstante(id: number, estante: EstanteRequestDto): Observable<EstanteResponseDto> {
    return this.http.put<EstanteResponseDto>(`${this.apiUrl}/estantes/${id}`, estante);
  }

  limparEstante(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/estantes/${id}/limpar`, {});
  }

  excluirEstante(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/estantes/${id}`);
  }

  private montarEstantes(
    estantes: EstanteResponseDto[],
    exemplares: ExemplarResponse[],
    materiais: MaterialResponse[],
    autores: AutorResponse[],
  ): EstanteVirtualDto[] {
    const materiaisPorId = new Map(materiais.map((material) => [material.id, material]));
    const autoresPorId = new Map(autores.map((autor) => [autor.id, autor.nome]));
    const exemplaresPorEstante = new Map<number, ExemplarVirtualDto[]>();

    for (const exemplar of exemplares) {
      if (exemplar.estanteId == null) {
        continue;
      }
      const material = materiaisPorId.get(exemplar.materialId);
      if (!material) {
        throw new Error(
          `O exemplar ${exemplar.id} referencia um material que não foi encontrado.`,
        );
      }

      const autorIds = [
        ...new Set([
          ...(material.autorIds ?? []),
          ...(material.autorId ? [material.autorId] : []),
        ]),
      ];
      const materialVirtual: MaterialVirtualDto = {
        id: material.id,
        titulo: material.titulo,
        tipo: material.tipo,
        autores: autorIds
          .map((autorId) => autoresPorId.get(autorId))
          .filter((nome): nome is string => nome !== undefined),
        anoPublicacao: material.anoPublicacao,
        isbn: material.isbn,
        issn: material.issn,
        descricao: material.descricao,
        sinopse: material.sinopse,
      };
      const exemplarVirtual: ExemplarVirtualDto = {
        id: exemplar.id,
        codigoBarras: exemplar.codigoBarras,
        status: exemplar.status,
        posicao: exemplar.posicao,
        prateleira: exemplar.prateleira,
        material: materialVirtual,
      };
      const exemplaresDaEstante = exemplaresPorEstante.get(exemplar.estanteId) ?? [];
      exemplaresDaEstante.push(exemplarVirtual);
      exemplaresPorEstante.set(exemplar.estanteId, exemplaresDaEstante);
    }

    return estantes.map((estante) => {
      const exemplaresDaEstante = exemplaresPorEstante.get(estante.id) ?? [];
      const prateleirasPorNome = new Map<string, PrateleiraVirtualDto>();
      const capacidade = estante.capacidade ?? 100;

      for (const exemplar of exemplaresDaEstante) {
        const nomePrateleira = exemplar.prateleira?.trim() || 'Prateleira 1';
        const prateleira = prateleirasPorNome.get(nomePrateleira) ?? {
          nome: nomePrateleira,
          posicaoInicial: 1,
          posicaoFinal: capacidade,
          ordem: prateleirasPorNome.size + 1,
          exemplares: [],
        };
        prateleira.exemplares.push(exemplar);
        prateleirasPorNome.set(nomePrateleira, prateleira);
      }

      const quantidadePrateleiras = estante.qtdPrateleiras ?? 0;
      const configuradas = estante.prateleiras ?? [];
      if (configuradas.length === 0) {
        for (let numero = 1; prateleirasPorNome.size < quantidadePrateleiras; numero++) {
          const nomePrateleira = `Prateleira ${numero}`;
          if (!prateleirasPorNome.has(nomePrateleira)) {
            prateleirasPorNome.set(nomePrateleira, {
              nome: nomePrateleira,
              posicaoInicial: 1,
              posicaoFinal: capacidade,
              ordem: numero,
              exemplares: [],
            });
          }
        }
      }

      const nomesConfigurados = new Set(configuradas.map((config) => config.nome));
      const prateleirasConfiguradas = configuradas.length
        ? [
          ...configuradas.map((config: EstantePrateleiraDto) => ({
            ...config,
            exemplares: [...(prateleirasPorNome.get(config.nome)?.exemplares ?? [])]
              .sort((a, b) => Number(a.posicao) - Number(b.posicao)),
          })),
          ...[...prateleirasPorNome.values()]
            .filter((prateleira) => !nomesConfigurados.has(prateleira.nome))
            .map((prateleira, index) => ({
              ...prateleira,
              ordem: configuradas.length + index + 1,
              exemplares: [...prateleira.exemplares]
                .sort((a, b) => Number(a.posicao) - Number(b.posicao)),
            })),
        ]
        : [...prateleirasPorNome.values()].map((prateleira) => ({
            ...prateleira,
            exemplares: [...prateleira.exemplares]
              .sort((a, b) => Number(a.posicao) - Number(b.posicao)),
          }));

      return {
        id: estante.id,
        nome: estante.nome,
        filialId: estante.filialId,
        localizacao: estante.localizacao,
        capacidade: estante.capacidade,
        prateleiras: prateleirasConfiguradas.sort(
          (a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome, 'pt-BR'),
        ),
      };
    });
  }
}
