import { ActivatedRoute } from '@angular/router';

/** Endereços das listagens, para não repetir os caminhos (alguns têm nomes antigos) pelo código. */
export const ROTAS = {
  materiais: '/editarExcluirMaterial',
  usuarios: '/editar-excluir-usuario',
  funcionarios: '/funcionarios',
  historico: '/historicoEmprestimo',
} as const;

/** O `:id` da rota como número, ou `null` se não for um id válido. */
export function idDaRota(rota: ActivatedRoute): number | null {
  const id = Number(rota.snapshot.paramMap.get('id'));
  return Number.isInteger(id) && id > 0 ? id : null;
}
