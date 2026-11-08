import { describe, expect, it } from 'vitest';
import { ExemplarResponse } from '../../models/exemplar.model';
import { MaterialResponse } from '../../models/material.model';
import { opcoesMateriaisParaEstante } from './material-estante.util';

describe('opcoesMateriaisParaEstante', () => {
  const materiais: MaterialResponse[] = [
    { id: 1, titulo: 'Java', tipo: 'LIVRO', dataCriacao: '', dataUltimaAtualizacao: '' },
    { id: 2, titulo: 'Java', tipo: 'PERIODICO', dataCriacao: '', dataUltimaAtualizacao: '' },
    { id: 3, titulo: 'Atlas', tipo: 'OUTRO', dataCriacao: '', dataUltimaAtualizacao: '' },
  ];

  const exemplar = (materialId: number, estanteId: number | null): ExemplarResponse => ({
    id: materialId + 10,
    materialId,
    filialId: 1,
    estanteId,
    ativo: false,
    codigoBarras: `COD-${materialId}`,
    dataCriacao: '',
    dataUltimaAtualizacao: '',
  });
  const estantesAtivas = new Set([4]);

  it('lista todos os tipos, ordena por título e preserva títulos iguais por ID', () => {
    expect(opcoesMateriaisParaEstante(materiais, [], estantesAtivas)).toEqual([
      { id: 3, nome: 'Atlas', desabilitado: false },
      { id: 1, nome: 'Java', desabilitado: false },
      { id: 2, nome: 'Java', desabilitado: false },
    ]);
  });

  it('mantém todos visíveis e desabilita apenas os IDs associados a uma estante', () => {
    expect(opcoesMateriaisParaEstante(materiais, [exemplar(1, 4), exemplar(2, null)], estantesAtivas)).toEqual([
      { id: 3, nome: 'Atlas', desabilitado: false },
      { id: 1, nome: 'Java', desabilitado: true },
      { id: 2, nome: 'Java', desabilitado: false },
    ]);
  });

  it('considera exemplar sem estanteId como não associado a uma estante', () => {
    const exemplarSemEstanteId = { ...exemplar(1, null), estanteId: undefined };

    expect(opcoesMateriaisParaEstante(materiais, [exemplarSemEstanteId], estantesAtivas)).toEqual([
      { id: 3, nome: 'Atlas', desabilitado: false },
      { id: 1, nome: 'Java', desabilitado: false },
      { id: 2, nome: 'Java', desabilitado: false },
    ]);
  });

  it('ignora exemplares vinculados a estantes inativas', () => {
    expect(opcoesMateriaisParaEstante(materiais, [exemplar(1, 99)], estantesAtivas)).toEqual([
      { id: 3, nome: 'Atlas', desabilitado: false },
      { id: 1, nome: 'Java', desabilitado: false },
      { id: 2, nome: 'Java', desabilitado: false },
    ]);
  });
});
