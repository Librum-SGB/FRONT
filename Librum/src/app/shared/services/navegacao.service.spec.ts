import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';

import { NavegacaoService } from './navegacao.service';

@Component({ template: '' })
class TelaVazia {}

describe('NavegacaoService', () => {
  let navegacao: NavegacaoService;
  let router: Router;
  let location: Location;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'reservar', component: TelaVazia, data: { titulo: 'Realizar Empréstimo' } },
          { path: 'materiais/:id', component: TelaVazia, data: { titulo: 'Material' } },
          { path: 'materiais/:id/editar', component: TelaVazia, data: { titulo: 'Editar material' } },
          { path: 'editarExcluirMaterial', component: TelaVazia, data: { titulo: 'Materiais' } },
        ]),
      ],
    });
    navegacao = TestBed.inject(NavegacaoService);
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
  });

  it('vai para o destino padrão quando a pessoa abriu a tela direto', async () => {
    await router.navigateByUrl('/materiais/7');
    const navegar = vi.spyOn(router, 'navigate');
    const voltar = vi.spyOn(location, 'back');

    navegacao.voltar('/editarExcluirMaterial');

    expect(voltar).not.toHaveBeenCalled();
    expect(navegar).toHaveBeenCalledWith(['/editarExcluirMaterial']);
  });

  it('volta para a tela anterior quando a pessoa navegou pelo sistema', async () => {
    await router.navigateByUrl('/reservar');
    await router.navigateByUrl('/materiais/7');
    const voltar = vi.spyOn(location, 'back');

    navegacao.voltar('/editarExcluirMaterial');

    expect(voltar).toHaveBeenCalledOnce();
  });

  it('trocas de URL com replaceUrl (filtros) não contam como tela anterior', async () => {
    await router.navigateByUrl('/materiais/7');
    await router.navigateByUrl('/materiais/7?busca=x', { replaceUrl: true });

    expect(navegacao.podeVoltar).toBe(false);
  });

  it('a origem é a tela anterior, com o título da rota', async () => {
    await router.navigateByUrl('/reservar');
    expect(navegacao.origem()).toBeNull();

    await router.navigateByUrl('/materiais/7');

    expect(navegacao.origem()).toEqual(expect.objectContaining({ url: '/reservar', titulo: 'Realizar Empréstimo' }));
  });

  it('a tela pode trocar o próprio título (ex.: nome do material) para o caminho das próximas', async () => {
    await router.navigateByUrl('/materiais/7');
    navegacao.definirTitulo('Dom Casmurro');

    await router.navigateByUrl('/materiais/7/editar');

    expect(navegacao.origem()?.titulo).toBe('Dom Casmurro');
  });
});
