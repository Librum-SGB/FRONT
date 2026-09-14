import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Modal } from '../modal/modal';
import { GeneroRequest, GeneroResponse } from '../../../models/genero.model';
import { GeneroService } from '../../../services/genero';
import { ToastService } from '../../services/toast.service';


@Component({
  selector: 'app-cadastro-genero-modal',
  imports: [CommonModule, ReactiveFormsModule, Modal],
  templateUrl: './cadastro-genero-modal.html',
  styleUrl: './cadastro-genero-modal.scss',
})
export class CadastroGeneroModal {
  @Output() generoCriado = new EventEmitter<GeneroResponse>();
  @Output() fechar = new EventEmitter<void>();

  form: FormGroup;
  salvando = false;

  constructor(
    private fb: FormBuilder,
    private generoService: GeneroService,
    private toastService: ToastService,
  ) {
    this.form = this.fb.group({
      nome: ['', Validators.required],
      descricao: [''],
    });
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.salvando = true;

    const genero: GeneroRequest = {
      nome: this.form.value.nome,
      descricao: this.form.value.descricao || undefined,
    };

    this.generoService.create(genero).subscribe({
      next: (response) => {
        this.toastService.sucesso('Gênero cadastrado com sucesso!');
        this.generoCriado.emit(response);
        this.salvando = false;
      },
      error: (err) => {
        console.error('Erro ao cadastrar gênero:', err);
        this.toastService.erro('Erro ao cadastrar gênero.');
        this.salvando = false;
      },
    });
  }

  cancelar(): void {
    this.fechar.emit();
  }
}