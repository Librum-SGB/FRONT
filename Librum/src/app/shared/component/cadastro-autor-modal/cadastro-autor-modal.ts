import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Modal } from '../modal/modal';
import { AutorRequest, AutorResponse } from '../../../models/autor.model';
import { AutorService } from '../../../services/autor';
import { ToastService } from '../../services/toast.service';



@Component({
  selector: 'app-cadastro-autor-modal',
  imports: [CommonModule, ReactiveFormsModule, Modal],
  templateUrl: './cadastro-autor-modal.html',
  styleUrl: './cadastro-autor-modal.scss',
})
export class CadastroAutorModal {
  @Output() autorCriado = new EventEmitter<AutorResponse>();
  @Output() fechar = new EventEmitter<void>();

  form: FormGroup;
  salvando = false;

  constructor(
    private fb: FormBuilder,
    private autorService: AutorService,
    private toastService: ToastService,
  ) {
    this.form = this.fb.group({
      nome: ['', Validators.required],
      nacionalidade: [''],
      dataNascimento: [''],
      dataFalecimento: [''],
      biografia: [''],
    });
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.salvando = true;

    const autor: AutorRequest = {
      nome: this.form.value.nome,
      nacionalidade: this.form.value.nacionalidade || undefined,
      dataNascimento: this.form.value.dataNascimento || undefined,
      dataFalecimento: this.form.value.dataFalecimento || undefined,
      biografia: this.form.value.biografia || undefined,
    };

    this.autorService.create(autor).subscribe({
      next: (response) => {
        this.toastService.sucesso('Autor cadastrado com sucesso!');
        this.autorCriado.emit(response);
        this.salvando = false;
      },
      error: (err) => {
        console.error('Erro ao cadastrar autor:', err);
        this.toastService.erro('Erro ao cadastrar autor.');
        this.salvando = false;
      },
    });
  }

  cancelar(): void {
    this.fechar.emit();
  }
}