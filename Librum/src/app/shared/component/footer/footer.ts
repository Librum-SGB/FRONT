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

    

      if (event.key === 'ArrowDown') {

        this.isHoldingDown = true;

        return;
      }

      if (this.isHoldingDown) {

        this.secretWord += event.key.toLowerCase();

 

        if (this.secretWord.includes('capi')) {

          this.showDucks = true;

          
          this.cdr.detectChanges();

          console.log('Capivara Ativada');
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

    

      if (event.key === 'ArrowDown') {

        this.isHoldingDown = false;

        this.secretWord = '';
      }

    });

  }
}
