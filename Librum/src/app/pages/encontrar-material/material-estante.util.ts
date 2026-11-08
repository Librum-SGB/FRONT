import type { OpcaoSelect } from '../../shared/component/select-pesquisavel/select-pesquisavel';
import type { ExemplarResponse } from '../../models/exemplar.model';
import type { MaterialResponse } from '../../models/material.model';

export function opcoesMateriaisParaEstante(
  materiais: MaterialResponse[],
  exemplares: ExemplarResponse[],
  idsEstantesAtivas: ReadonlySet<number>,
): OpcaoSelect[] {
  const materiaisNaEstante = new Set(
    exemplares
      .filter(
        (exemplar) =>
          exemplar.estanteId != null && idsEstantesAtivas.has(exemplar.estanteId),
      )
      .map((exemplar) => exemplar.materialId),
  );

  return materiais
    .map((material) => ({
      id: material.id,
      nome: material.titulo,
      desabilitado: materiaisNaEstante.has(material.id),
    }))
    .sort(
      (a, b) =>
        a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }) || a.id - b.id,
    );
}
