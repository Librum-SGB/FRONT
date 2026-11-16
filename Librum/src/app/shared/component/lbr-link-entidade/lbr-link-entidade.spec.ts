import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { LbrLinkEntidade, TipoEntidade } from './lbr-link-entidade';
import { AuthService } from '../../../services/auth.service';

@Component({
  imports: [LbrLinkEntidade],
  template: `<lbr-link-entidade [tipo]="tipo()" [id]="id()" [texto]="texto()" [novaAba]="novaAba()" />`,
})
class HostTeste {
  tipo = signal<TipoEntidade>('usuario');
  id = signal<number | undefined>(12);
  texto = signal<string | undefined>('Ana Souza');
  novaAba = signal(false);
}

async function criar(permitido: boolean) {
  await TestBed.configureTestingModule({
    imports: [HostTeste],
    providers: [provideRouter([]), { provide: AuthService, useValue: { temPermissao: () => permitido } }],
  }).compileComponents();
  const fixture = TestBed.createComponent(HostTeste);
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

describe('LbrLinkEntidade', () => {
  it('leva para o detalhe do usuário', async () => {
    const fixture = await criar(true);
    const link = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;

    expect(link.getAttribute('href')).toBe('/usuarios/12');
    expect(link.textContent?.trim()).toBe('Ana Souza');
    expect(link.getAttribute('target')).toBeNull();
  });

  it('leva para o detalhe do material e pode abrir em nova aba', async () => {
    const fixture = await criar(true);
    fixture.componentInstance.tipo.set('material');
    fixture.componentInstance.id.set(7);
    fixture.componentInstance.novaAba.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    const link = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/materiais/7');
    expect(link.getAttribute('target')).toBe('_blank');
  });

  it('vira texto sem permissão ou sem id, com texto padrão quando não há nome', async () => {
    const fixture = await criar(false);
    expect(fixture.nativeElement.querySelector('a')).toBeNull();
    expect(fixture.nativeElement.textContent.trim()).toBe('Ana Souza');

    fixture.componentInstance.texto.set(undefined);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent.trim()).toBe('Usuário');
  });
});
