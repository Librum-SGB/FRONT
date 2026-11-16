import { Location } from '@angular/common';
import { computed, inject, Injectable, signal } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';

export interface TelaVisitada {
  /** Id da navegação que criou a entrada no histórico do navegador. */
  id: number;
  url: string;
  /** Nome exibido no caminho (breadcrumb): o `data.titulo` da rota ou o definido pela tela. */
  titulo: string;
}

interface InicioNavegacao {
  voltandoOuAvancando: boolean;
  idRestaurado?: number;
}

/**
 * Acompanha as telas visitadas dentro do sistema, para que "Voltar" e o caminho (breadcrumb)
 * levem para a tela de onde a pessoa veio (ex.: Realizar Empréstimo). Quando a tela foi aberta
 * direto pelo link, usam o destino padrão informado pela tela.
 * Precisa ser criado no início da aplicação (é injetado no App) para registrar a primeira tela.
 */
@Injectable({ providedIn: 'root' })
export class NavegacaoService {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly inicios = new Map<number, InicioNavegacao>();

  private readonly pilha = signal<TelaVisitada[]>([]);

  /** Tela anterior dentro do sistema, ou `null` se a atual foi aberta direto. */
  readonly origem = computed(() => {
    const pilha = this.pilha();
    return pilha.length > 1 ? pilha[pilha.length - 2] : null;
  });

  constructor() {
    this.router.events.subscribe((evento) => {
      if (evento instanceof NavigationStart) {
        this.inicios.set(evento.id, {
          voltandoOuAvancando: evento.navigationTrigger === 'popstate',
          idRestaurado: evento.restoredState?.navigationId,
        });
      } else if (evento instanceof NavigationEnd) {
        this.registrar(evento);
      }
    });
  }

  get podeVoltar(): boolean {
    return this.origem() !== null;
  }

  /** Nome da tela atual no caminho das próximas telas (ex.: o título do material). */
  definirTitulo(titulo: string): void {
    this.pilha.update((pilha) =>
      pilha.length ? [...pilha.slice(0, -1), { ...pilha[pilha.length - 1], titulo }] : pilha,
    );
  }

  voltar(destinoPadrao: string | readonly unknown[]): void {
    if (this.podeVoltar) {
      this.location.back();
    } else {
      void this.router.navigate(typeof destinoPadrao === 'string' ? [destinoPadrao] : [...destinoPadrao]);
    }
  }

  private registrar(evento: NavigationEnd): void {
    const inicio = this.inicios.get(evento.id);
    this.inicios.delete(evento.id);
    const tela: TelaVisitada = { id: evento.id, url: evento.urlAfterRedirects, titulo: this.tituloDaRota() };
    const substituiu = !!this.router.lastSuccessfulNavigation()?.extras.replaceUrl;

    this.pilha.update((pilha) => {
      // Voltar/avançar do navegador: a tela restaurada passa a ser a atual.
      if (inicio?.voltandoOuAvancando && inicio.idRestaurado != null) {
        const indice = pilha.findIndex((t) => t.id === inicio.idRestaurado);
        if (indice >= 0) return [...pilha.slice(0, indice), { ...pilha[indice], url: tela.url }];
      }
      // Troca de URL sem nova entrada no histórico (ex.: filtros): atualiza a tela atual.
      if (substituiu && pilha.length) {
        const atual = pilha[pilha.length - 1];
        const mesmaTela = atual.url.split('?')[0] === tela.url.split('?')[0];
        return [...pilha.slice(0, -1), { ...tela, titulo: mesmaTela ? atual.titulo : tela.titulo }];
      }
      return [...pilha, tela];
    });
  }

  private tituloDaRota(): string {
    let rota = this.router.routerState.snapshot.root;
    while (rota.firstChild) rota = rota.firstChild;
    return (rota.data['titulo'] as string | undefined) ?? '';
  }
}
