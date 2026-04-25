import { Component } from '@angular/core';
import { LinkPersonalizado } from "../link-personalizado/link-personalizado";
import { RouterLink } from "@angular/router";


@Component({
  selector: 'app-footer',
  imports: [LinkPersonalizado, RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {}
