import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';

import { DetalheUsuario } from './detalhe-usuario';
import { Usuario } from '../../models/usuario.model';
import { AuthService } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario.service';
import { ToastService } from '../../shared/services/toast.service';

const USUARIO: Usuario = {
  id: 12,
  nome: 'Ana Souza',
  cpf: '52998224725',
  email: 'ana@exemplo.com',
  filialId: 1,
  dataNascimento: '2000-05-20' as unknown as Date,
  cidade: 'São Paulo',
  estado: 'SP',
  limiteLivros: 3,
  estaBloqueado: false,
};

async function criar(opcoes: {
  usuario?: () => Observable<Usuario>;
  permitido?: boolean;
}): Promise<ComponentFixture<DetalheUsuario>> {
  await TestBed.configureTestingModule({
    imports: [DetalheUsuario],
    providers: [
      provideRouter([]),
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { paramMap: convertToParamMap({ id: '12' }) } },
      },
      { provide: ToastService, useValue: { erro: () => {}, sucesso: () => {} } },
      { provide: AuthService, useValue: { temPermissao: () => opcoes.permitido ?? true } },
      { provide: UsuarioService, useValue: { buscarPorId: opcoes.usuario ?? (() => of(USUARIO)) } },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(DetalheUsuario);
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

describe('DetalheUsuario', () => {
  it('exibe os dados do usuário', async () => {
    const fixture = await criar({});
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(texto).toContain('Ana Souza');
    expect(texto).toContain('ana@exemplo.com');
    expect(texto).toContain('20/05/2000');
    expect(texto).toContain('São Paulo / SP');
    expect(texto).toContain('Ativo');
  });

  it('mostra Editar e Excluir apenas com permissão', async () => {
    const fixture = await criar({ permitido: false });
    // os modais ficam fora do corpo da página; os botões de ação ficam dentro dele
    const texto =
      (fixture.nativeElement as HTMLElement).querySelector('app-corpo-padrao')?.textContent ?? '';

    expect(texto).toContain('Voltar');

    expect(texto).not.toContain('Editar');
    expect(texto).not.toContain('Excluir');
  });

  it('informa quando o usuário não existe', async () => {
    const fixture = await criar({
      usuario: () => throwError(() => new HttpErrorResponse({ status: 404 })),
    });

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Usuário não encontrado.');
  });
});
