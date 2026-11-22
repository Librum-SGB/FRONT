import { Component, computed, EventEmitter, inject, Output } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { ThemeService } from '../../services/theme.service';
import { Permissao } from '../../../enum/permissoes.enum';
import { AuthService } from '../../../services/auth.service';
import { FuncaoUsuario } from '../../../enum/funcaoUsuario.enum';
import { FilialService } from '../../../services/filial.service';

@Component({
  selector: 'app-navbar',
  imports: [FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  @Output() toggleSidebar = new EventEmitter<void>();

  protected readonly auth = inject(AuthService);
  protected readonly Permissao = Permissao;
  private readonly router = inject(Router);
  private readonly filialService = inject(FilialService);

  protected readonly podeSelecionarUnidade = computed(() =>
    this.auth.temFuncao(FuncaoUsuario.ADMIN, FuncaoUsuario.BIBLIOTECARIA, FuncaoUsuario.ASSISTENTE),
  );
  protected unidadeSelecionada = '';
  protected readonly unidadesAtivas = toSignal(
    toObservable(this.podeSelecionarUnidade).pipe(
      switchMap((podeSelecionar) => {
        if (!podeSelecionar) return of([]);

        return this.filialService.unidadesAlteradas$.pipe(
          startWith(undefined),
          switchMap(() =>
            this.filialService.listarAtivas().pipe(
              map((filiais) =>
                filiais
                  .filter((filial) => filial.ativo && filial.id != null)
                  .sort((a, b) => a.nomeFantasia.localeCompare(b.nomeFantasia, 'pt-BR')),
              ),
              catchError(() => of(null)),
            ),
          ),
        );
      }),
    ),
  );
  protected readonly rotuloSeletor = computed(() => {
    const unidades = this.unidadesAtivas();
    if (unidades === undefined) return 'Carregando unidades...';
    if (unidades === null) return 'Unidades indisponíveis';
    return unidades.length ? 'Selecionar Unidade' : 'Nenhuma unidade ativa';
  });

  constructor(public tema: ThemeService) {}

  /** Página inicial de cada perfil: aluno não tem dashboard */
  protected readonly paginaInicial = computed(() =>
    this.auth.temPermissao(Permissao.VER_DASHBOARD) ? '/dashboard' : '/estanteVirtual',
  );

  protected readonly nomeFuncao = computed(() => {
    const nomes: Record<FuncaoUsuario, string> = {
      [FuncaoUsuario.ADMIN]: 'Administrador',
      [FuncaoUsuario.BIBLIOTECARIA]: 'Bibliotecária',
      [FuncaoUsuario.ASSISTENTE]: 'Assistente',
      [FuncaoUsuario.USUARIO]: 'Usuário',
    };
    const f = this.auth.funcao();
    return f ? nomes[f] : '';
  });

  protected readonly nomeUsuario = computed(
    () => (this.auth.payload()?.['nome'] as string | undefined) ?? this.auth.payload()?.sub ?? '',
  );

  toggleTema(): void {
    this.tema.toggleTheme();
  }

  aoAlternarSidebar(): void {
    this.toggleSidebar.emit();
  }

  sair(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
