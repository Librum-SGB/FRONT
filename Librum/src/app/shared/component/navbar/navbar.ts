import { Component, computed, EventEmitter, inject, Output } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { Permissao } from '../../../enum/permissoes.enum';
import { AuthService } from '../../../services/auth.service';
import { FuncaoUsuario } from '../../../enum/funcaoUsuario.enum';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  @Output() toggleSidebar = new EventEmitter<void>();

  protected readonly auth = inject(AuthService);
  protected readonly Permissao = Permissao;
  private readonly router = inject(Router);

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
