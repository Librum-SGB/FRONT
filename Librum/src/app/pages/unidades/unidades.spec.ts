import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { environment } from '../../../environments/environment';
import { FilialResponse } from '../../models/filial.model';
import { authInterceptor } from '../../services/auth.interceptor';
import { AUTH_TOKEN_KEY } from '../../services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { CadastrarUnidade } from './cadastrar-unidade';
import { ListaUnidades } from './lista-unidades';

describe('Cadastro de unidades', () => {
  const url = `${environment.apiUrl}/filiais`;
  const toast = { sucesso: vi.fn(), erro: vi.fn() };
  let http: HttpTestingController;

  beforeEach(async () => {
    vi.clearAllMocks();
    sessionStorage.setItem(AUTH_TOKEN_KEY, 'token-teste');
    await TestBed.configureTestingModule({
      imports: [CadastrarUnidade, ListaUnidades],
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: ToastService, useValue: toast },
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  });

  afterEach(() => {
    http.verify();
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
  });

  function preencher(component: CadastrarUnidade): void {
    component.form.patchValue({
      nomeFantasia: '  Biblioteca Centro  ',
      razaoSocial: 'Biblioteca Centro Ltda.',
      cnpj: '12.345.678/0001-95',
      endereco: 'Rua das Flores',
      numero: '100',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01001-000',
      telefone: '(11) 99999-9999',
      email: 'centro@biblioteca.com',
      horarioFuncionamento: 'Segunda a sexta, das 8h às 18h',
      ativo: false,
    });
  }

  it('impede registros vazios, espaços e formatos incompletos', () => {
    const fixture = TestBed.createComponent(CadastrarUnidade);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    component.salvar();
    http.expectNone(url);
    expect(component.mensagensErro()).toContain('Preencha todos os campos obrigatórios.');
    preencher(component);
    component.form.patchValue({
      nomeFantasia: '  ',
      cnpj: '12.345',
      cep: '01001',
      email: 'invalido',
    });
    component.salvar();
    http.expectNone(url);
    expect(component.isInvalido('nomeFantasia')).toBe(true);
    expect(component.isInvalido('cnpj')).toBe(true);
    expect(component.isInvalido('cep')).toBe(true);
    expect(component.isInvalido('email')).toBe(true);
    expect(toast.sucesso).not.toHaveBeenCalled();
  });

  it('envia dados normalizados e autenticados e retorna à lista somente após a API confirmar', () => {
    const fixture = TestBed.createComponent(CadastrarUnidade);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    preencher(component);
    component.salvar();
    component.salvar();
    component.cancelar();
    fixture.detectChanges();
    const request = http.expectOne(url);
    expect(request.request.method).toBe('POST');
    expect(request.request.headers.get('Authorization')).toBe('Bearer token-teste');
    expect(request.request.body).toMatchObject({
      nomeFantasia: 'Biblioteca Centro',
      cnpj: '12345678000195',
      cep: '01001000',
      telefone: '11999999999',
      ativo: false,
      horarioFuncionamento: 'Segunda a sexta, das 8h às 18h',
    });
    expect(request.request.body.id).toBeUndefined();
    expect(fixture.nativeElement.querySelector('fieldset').disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBe(true);
    expect(toast.sucesso).not.toHaveBeenCalled();
    expect(TestBed.inject(Router).navigate).not.toHaveBeenCalled();
    request.flush({ id: 1, ...request.request.body });
    expect(toast.sucesso).toHaveBeenCalledWith('Unidade cadastrada com sucesso!');
    expect(TestBed.inject(Router).navigate).toHaveBeenCalledWith(['/unidades']);
    expect(component.salvando()).toBe(false);
  });

  it('preserva os dados quando o servidor rejeita e permite nova tentativa', () => {
    const fixture = TestBed.createComponent(CadastrarUnidade);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    preencher(component);
    component.salvar();
    http
      .expectOne(url)
      .flush({ message: 'CNPJ já cadastrado.' }, { status: 409, statusText: 'Conflict' });
    expect(component.mensagensErro()).toEqual(['CNPJ já cadastrado.']);
    expect(component.form.controls.cnpj.value).toBe('12.345.678/0001-95');
    expect(component.salvando()).toBe(false);
    expect(TestBed.inject(Router).navigate).not.toHaveBeenCalled();
    component.salvar();
    http.expectOne(url).flush({ id: 2 });
    expect(toast.sucesso).toHaveBeenCalledOnce();
  });

  it('mostra erros dos campos retornados pelo backend e falhas de conexão', () => {
    const fixture = TestBed.createComponent(CadastrarUnidade);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    preencher(component);
    component.salvar();
    http
      .expectOne(url)
      .flush(
        { message: 'Dados inválidos', fieldErrors: { cnpj: 'CNPJ inválido' } },
        { status: 400, statusText: 'Bad Request' },
      );
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'CNPJ inválido',
    );
    component.salvar();
    http.expectOne(url).error(new ProgressEvent('error'));
    expect(component.mensagensErro()).toEqual([
      'Não foi possível conectar ao servidor. Tente novamente.',
    ]);
    expect(component.form.controls.cidade.value).toBe('São Paulo');
  });

  it('aceita contato opcional e telefone fixo sem enviar formatação ao banco', () => {
    const fixture = TestBed.createComponent(CadastrarUnidade);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    preencher(component);
    component.form.patchValue({ telefone: '(11) 3333-4444', email: '' });
    component.salvar();
    const request = http.expectOne(url);
    expect(request.request.body.telefone).toBe('1133334444');
    expect(request.request.body.email).toBeUndefined();
    request.flush({ id: 3 });
  });

  function unidade(id: number): FilialResponse {
    return {
      id,
      nomeFantasia: `Biblioteca ${id}`,
      razaoSocial: `Biblioteca ${id} Ltda.`,
      cnpj: '12345678000195',
      endereco: 'Rua das Flores',
      bairro: 'Centro',
      cidade: id === 1 ? 'São Paulo' : 'Campinas',
      estado: 'SP',
      cep: '01001000',
      ativo: id !== 1,
      dataCriacao: '',
      dataUltimaAtualizacao: '',
    };
  }

  it('lista dados da API com paginação e permite buscar sem acentos e filtrar por status', () => {
    const fixture = TestBed.createComponent(ListaUnidades);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    const request = http.expectOne(url);
    expect(request.request.method).toBe('GET');
    request.flush(Array.from({ length: 12 }, (_, i) => unidade(i + 1)));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(10);
    expect(fixture.nativeElement.textContent).toContain('Exibindo 1–10 de 12');
    const proxima = [...fixture.nativeElement.querySelectorAll('.page-link')].find(
      (button: any) => button.textContent.trim() === 'Próxima',
    ) as HTMLButtonElement;
    proxima.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(2);
    component.filtros.set({ busca: 'sao paulo' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(1);
    expect(fixture.nativeElement.querySelector('tbody').textContent).toContain('Biblioteca 1');
    component.filtros.set({ busca: 'sao paulo', status: ['true'] });
    fixture.detectChanges();
    expect(component.unidadesFiltradas().length).toBe(0);
    expect(fixture.nativeElement.textContent).toContain('Nenhuma unidade encontrada');
  });

  it('permite tentar novamente quando a listagem falha', () => {
    const fixture = TestBed.createComponent(ListaUnidades);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    http.expectOne(url).error(new ProgressEvent('error'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'Não foi possível carregar',
    );
    fixture.nativeElement.querySelector('[role="alert"] button').click();
    http.expectOne(url).flush([unidade(1)]);
    fixture.detectChanges();
    expect(component.unidades().length).toBe(1);
    expect(fixture.nativeElement.querySelector('tbody').textContent).toContain('Biblioteca 1');
  });
});
