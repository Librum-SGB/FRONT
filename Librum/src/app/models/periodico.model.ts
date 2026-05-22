export interface Periodico {
    id?: number;
    titulo: string;
    editor: string;
    edicaoVolumeNumero: string
    dataPublicacao?: string;
    issn: string;
    tema?: string;
    descricao?: string;
    quantidadeExemplares?: number;
    localizacao?: string;
    unidade?: string;
}