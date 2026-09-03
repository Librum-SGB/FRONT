import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Modal } from '../modal/modal';
import { EditoraRequest, EditoraResponse } from '../../../models/editora.model';
import { EditoraService } from '../../../services/editora';
import { ToastService } from '../../services/toast.service';


@Component({
  selector: 'app-cadastro-editora-modal',
  imports: [CommonModule, ReactiveFormsModule, Modal],
  templateUrl: './cadastro-editora-modal.html',
  styleUrl: './cadastro-editora-modal.scss',
})
export class CadastroEditoraModal {
  @Output() editoraCriada = new EventEmitter<EditoraResponse>();
  @Output() fechar = new EventEmitter<void>();

  form: FormGroup;
  salvando = false;

  constructor(
    private fb: FormBuilder,
    private editoraService: EditoraService,
    private toastService: ToastService,
  ) {
    this.form = this.fb.group({
      nome: ['', Validators.required],
      nacionalidade: [''],
    });
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.salvando = true;

    const editora: EditoraRequest = {
      nome: this.form.value.nome,
      nacionalidade: this.form.value.nacionalidade || undefined,
    };

    this.editoraService.create(editora).subscribe({
      next: (response) => {
        this.toastService.sucesso('Editora cadastrada com sucesso!');
        this.editoraCriada.emit(response);
        this.salvando = false;
      },
      error: (err) => {
        console.error('Erro ao cadastrar editora:', err);
        this.toastService.erro('Erro ao cadastrar editora.');
        this.salvando = false;
      },
    });
  }

  cancelar(): void {
    this.fechar.emit();
  }
}