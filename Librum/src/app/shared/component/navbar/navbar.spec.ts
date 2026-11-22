import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../../environments/environment';
import { FuncaoUsuario } from '../../../enum/funcaoUsuario.enum';
import { FilialRequest } from '../../../models/filial.model';
import { AUTH_TOKEN_KEY, AuthService } from '../../../services/auth.service';
import { FilialService } from '../../../services/filial.service';
import { Navbar } from './navbar';

describe('Navbar', () => {
  const url = `${environment.apiUrl}/filiais`;
  const dados: FilialRequest = {
    nomeFantasia: 'Biblioteca Norte',
    razaoSocial: 'Biblioteca Norte',
    cnpj: '12345678000195',
    endereco: 'Rua Nova',
    bairro: 'Centro',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01001000',
    ativo: true,
  };
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
  });

  async function abrirNavbar(funcao: FuncaoUsuario) {
    const payload = btoa(JSON.stringify({ funcao }));
    TestBed.inject(AuthService).saveToken(`teste.${payload}.teste`);
    const fixture = TestBed.createComponent(Navbar);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  }

  it('carrega unidades ativas e atualiza a lista depois de salvar, preservando a seleção', async () => {
    const fixture = await abrirNavbar(FuncaoUsuario.ADMIN);
    const seletor = () => (fixture.nativeElement as HTMLElement).querySelector('select')!;
    const anterior = { ...dados, id: 1, nomeFantasia: 'Biblioteca Sul' };
    const inativa = { ...dados, id: 2, nomeFantasia: 'Biblioteca Inativa', ativo: false };
    const nova = { ...dados, id: 3 };

    http.expectOne({ method: 'GET', url: `${url}?ativo=true` }).flush([inativa, anterior]);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(Array.from(seletor().options, (opcao) => opcao.textContent)).toEqual([
      'Selecionar Unidade',
      'Biblioteca Sul',
    ]);

    seletor().value = '1';
    seletor().dispatchEvent(new Event('change'));
    TestBed.inject(FilialService).criar(dados).subscribe();
    const cadastro = http.expectOne({ method: 'POST', url });
    http.expectNone(`${url}?ativo=true`);
    cadastro.flush(nova, { status: 201, statusText: 'Created' });
    http.expectOne({ method: 'GET', url: `${url}?ativo=true` }).flush([anterior, nova]);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(Array.from(seletor().options, (opcao) => opcao.textContent)).toEqual([
      'Selecionar Unidade',
      'Biblioteca Norte',
      'Biblioteca Sul',
    ]);
    expect(seletor().value).toBe('1');
  });

  it('não consulta unidades com um perfil de aluno', async () => {
    const fixture = await abrirNavbar(FuncaoUsuario.USUARIO);
    expect((fixture.nativeElement as HTMLElement).querySelector('.unit-selector')).toBeNull();
    http.expectNone(`${url}?ativo=true`);
  });
});
