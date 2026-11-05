import { Component, EventEmitter, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  @Output() toggleSidebar = new EventEmitter<void>();
  constructor(public tema: ThemeService) {}

  toggleTema() {
    this.tema.toggleTheme();
  }
  aoAlternarSidebar() {
    this.toggleSidebar.emit();
  }

}
