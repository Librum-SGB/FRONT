import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat-suporte',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-suporte.html',
  styleUrls: ['./chat-suporte.scss']
})
export class ChatSuporte {
  // Variável que armazena o texto que o usuário está digitando
  textoMensagem: string = '';

  // Lista inicial de mensagens (simulando o histórico)
  mensagens = [
    { texto: 'Olá! Como posso te ajudar com o sistema hoje?', origem: 'support', hora: '14:32' },
    { texto: 'Preciso de ajuda com o botão de redirecionamento.', origem: 'user', hora: '14:33' }
  ];

  constructor(private router: Router) {}

  voltarParaSuporte() {
    this.router.navigate(['/suporte']);
  }

  // Função que adiciona a nova mensagem na lista
  enviarMensagem() {
    // Impede de enviar mensagens vazias ou apenas com espaços
    if (!this.textoMensagem.trim()) return;

    const agora = new Date();
    const horaFormatada = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    // Adiciona a nova mensagem do usuário no array
    this.mensagens.push({
      texto: this.textoMensagem,
      origem: 'user',
      hora: horaFormatada
    });

    // Limpa o campo de texto após o envio
    this.textoMensagem = '';
  }
}