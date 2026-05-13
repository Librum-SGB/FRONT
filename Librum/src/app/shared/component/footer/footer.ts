import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { LinkPersonalizado } from '../link-personalizado/link-personalizado';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-footer',
  imports: [LinkPersonalizado, CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer implements OnInit {

  showDucks = false;

  private secretWord = '';

  private isHoldingDown = false;

  constructor(
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {

    window.addEventListener('keydown', (event) => {

      // Detecta seta para baixo

      if (event.key === 'ArrowDown') {

        this.isHoldingDown = true;

        return;
      }

      // Enquanto segura ↓

      if (this.isHoldingDown) {

        this.secretWord += event.key.toLowerCase();

        // Ativa os patinhos

        if (this.secretWord.includes('pato')) {

          this.showDucks = true;

          // Atualiza a tela instantaneamente

          this.cdr.detectChanges();

          console.log('🦆 Patinhos ativados');
          setTimeout(() => {

            this.showDucks = false;

            this.cdr.detectChanges();

          }, 12000);

          this.secretWord = '';
        }

        // Limita tamanho

        if (this.secretWord.length > 10) {

          this.secretWord = '';
        }

      }

    });

    window.addEventListener('keyup', (event) => {

      // Soltou a seta ↓

      if (event.key === 'ArrowDown') {

        this.isHoldingDown = false;

        this.secretWord = '';
      }

    });

  }
}
