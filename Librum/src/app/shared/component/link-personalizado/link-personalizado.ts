import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-link-personalizado',
  imports: [RouterLink],
  templateUrl: './link-personalizado.html',
  styleUrl: './link-personalizado.scss'
})
export class LinkPersonalizado {

  @Input() link = '';

  @Input() rapido = false;

}