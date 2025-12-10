import { Component, ViewChild, ElementRef, AfterViewChecked, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
}

interface Chat {
  id: number;
  title: string;
  date: string;
}

@Component({
  selector: 'app-enichatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './enichatbot.component.html',
  styleUrl: './enichatbot.component.css',
  animations: [
    trigger('messageAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class EnichatbotComponent implements AfterViewChecked {
    @Input() isEniChat: boolean = false;
  @ViewChild('messagesContainer') private messagesContainer?: ElementRef;
  @ViewChild('messageInput') private messageInput?: ElementRef;

  messages: Message[] = [];
  inputValue: string = '';
  searchQuery: string = '';
  activeChat: number | null = null;
  isTyping: boolean = false;
  private shouldScrollToBottom = false;
  
  chats: Chat[] = [
    { id: 1, title: 'Optimiser lettre de motivation', date: 'Aujourd\'hui' },
    { id: 2, title: 'Choisir plateforme de recrutement', date: 'Hier' },
    { id: 3, title: 'Social media icon styling', date: '3 jours' },
    { id: 4, title: 'Web page design and styling', date: '1 semaine' },
    { id: 5, title: 'Angular components best practices', date: '2 semaines' }
  ];

  // Réponses prédéfinies du bot
  private botResponses = [
    "Excellente question ! Je suis là pour vous aider avec Angular. Pouvez-vous me donner plus de détails ?",
    "Je comprends votre besoin. Laissez-moi vous guider à travers les étapes nécessaires.",
    "C'est une approche intéressante ! Voici ce que je vous recommande...",
    "Pour optimiser votre code, je vous suggère de suivre ces bonnes pratiques Angular.",
    "Parfait ! Je peux vous aider avec ça. Commençons par les bases.",
  ];

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  handleSend(): void {
  if (this.inputValue.trim()) {
    // Si aucun chat actif, créer un nouveau chat automatiquement
    if (!this.activeChat) {
      const newChat: Chat = {
        id: Date.now(),
        title: this.inputValue.length > 20 ? this.inputValue.slice(0, 20) + '...' : this.inputValue,
        date: 'Maintenant'
      };
      this.chats.unshift(newChat);
      this.activeChat = newChat.id; // Rendre ce chat actif
      this.messages = [];           // Reset messages
    }

    const userMessage: Message = {
      id: Date.now(),
      text: this.inputValue,
      sender: 'user',
      timestamp: this.getCurrentTime()
    };

    this.messages.push(userMessage);
    this.inputValue = '';
    this.shouldScrollToBottom = true;

    // Simuler l'indicateur de saisie
    this.isTyping = true;

    // Réponse du bot
    const delay = Math.random() * 1000 + 1500; // 1.5s à 2.5s
    setTimeout(() => {
      this.isTyping = false;
      const botMessage: Message = {
        id: Date.now() + 1,
        text: this.getRandomBotResponse(),
        sender: 'bot',
        timestamp: this.getCurrentTime()
      };
      this.messages.push(botMessage);
      this.shouldScrollToBottom = true;
    }, delay);

    setTimeout(() => {
      this.messageInput?.nativeElement.focus();
    }, 100);
  }
}


  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.handleSend();
    }
  }

handleNewChat(): void {
  const newChat: Chat = {
    id: Date.now(),
    title: 'Nouvelle conversation',
    date: 'Maintenant'
  };
  this.chats.unshift(newChat);   // Ajouter en haut
  this.activeChat = newChat.id;  // Sélectionner automatiquement
  this.messages = [];             // Reset messages
  this.isTyping = false;

  // Focus sur input
  setTimeout(() => {
    this.messageInput?.nativeElement.focus();
  }, 100);
}


  selectChat(chatId: number): void {
    this.activeChat = chatId;
    this.messages = [];
    this.isTyping = false;
    
    // Charger les messages du chat (simulation)
    setTimeout(() => {
      this.messages = [
        {
          id: 1,
          text: "Bonjour ! Comment puis-je vous aider aujourd'hui ?",
          sender: 'bot',
          timestamp: '14:30'
        }
      ];
      this.shouldScrollToBottom = true;
    }, 300);
  }

  useSuggestion(text: string): void {
    this.inputValue = text;
    this.handleSend();
  }

  private getCurrentTime(): string {
    return new Date().toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  private getRandomBotResponse(): string {
    const randomIndex = Math.floor(Math.random() * this.botResponses.length);
    return this.botResponses[randomIndex];
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        const element = this.messagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    } catch(err) {
      console.error('Erreur lors du scroll:', err);
    }
  }
}