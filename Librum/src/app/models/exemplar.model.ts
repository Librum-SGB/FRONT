export interface ExemplarRequest {
  materialId: number;
  filialId: number;
  estanteId: number;

  codigoBarras: string;

  prateleira?: string;
  posicao?: string;

  status?: string; // enum StatusExemplar do backend

  dataAquisicao?: string; // LocalDate chega/sai como 'YYYY-MM-DD'
  observacoes?: string;
}

export interface ExemplarResponse {
  id: number;

  materialId: number;
  filialId: number;
  estanteId: number;

  codigoBarras: string;

  prateleira?: string;
  posicao?: string;

  status?: string;

  dataAquisicao?: string;
  observacoes?: string;

  dataCriacao: string; // OffsetDateTime chega como string ISO
  dataUltimaAtualizacao: string;
}