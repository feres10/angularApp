import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../core/services/chat.service';
import { TeamService } from '../../core/services/team.service';
import { extractList } from '../../core/utils/api-response';

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  memberCount: number;
}

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  conversations: Conversation[] = [];
  messages: ChatMessage[] = [];
  selectedConversation: Conversation | null = null;

  constructor(
    private chatService: ChatService,
    private teamService: TeamService
  ) {}

  ngOnInit(): void {
    this.loadConversations();
  }

  loadConversations(): void {
    this.teamService.getAllTeams(0, 100).subscribe({
      next: response => {
        this.conversations = extractList<any>(response).map(team => ({
          id: String(team.id),
          name: team.name ?? '',
          lastMessage: '',
          time: '',
          unreadCount: 0,
          memberCount: team.memberCount ?? team.members?.length ?? 0
        }));
        if (this.conversations.length > 0) {
          this.selectConversation(this.conversations[0]);
        }
      },
      error: error => alert(error.error?.message ?? 'Unable to load conversations')
    });
  }

  selectConversation(conversation: Conversation): void {
    this.selectedConversation = conversation;
    this.loadMessages();
  }

  loadMessages(): void {
    if (!this.selectedConversation) return;
    this.chatService.getTeamMessages(Number(this.selectedConversation.id), 0, 100).subscribe({
      next: response => {
        this.messages = extractList<any>(response).map(message => ({
          id: String(message.id),
          sender: `${message.sender?.firstname ?? ''} ${message.sender?.lastname ?? ''}`.trim() || 'User',
          text: message.content ?? '',
          time: message.timestamp ?? ''
        }));
      },
      error: error => alert(error.error?.message ?? 'Unable to load messages')
    });
  }

  onSendMessage(content: string): void {
    if (!this.selectedConversation || !content.trim()) return;
    this.chatService.sendMessage({
      teamId: Number(this.selectedConversation.id),
      content: content.trim(),
      messageType: 'CHAT'
    }).subscribe({
      next: () => this.loadMessages(),
      error: error => alert(error.error?.message ?? 'Unable to send message')
    });
  }
}
