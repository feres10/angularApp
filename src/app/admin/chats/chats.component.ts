import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../core/services/chat.service';
import { extractList } from '../../core/utils/api-response';

interface ChatRoom {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageTime: string;
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
  selector: 'app-chats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.css']
})
export class ChatsComponent implements OnInit {
  chats: ChatRoom[] = [];
  messages: ChatMessage[] = [];
  selectedChat: ChatRoom | null = null;

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.loadChats();
  }

  loadChats(): void {
    this.chatService.getAdminTeamChats().subscribe({
      next: response => {
        this.chats = extractList<any>(response).map(team => ({
          id: String(team.id),
          name: team.name ?? '',
          lastMessage: '',
          lastMessageTime: '',
          unreadCount: 0,
          memberCount: team.memberCount ?? team.members?.length ?? 0
        }));
        if (this.chats.length > 0) {
          this.selectChat(this.chats[0]);
        }
      },
      error: error => alert(error.error?.message ?? 'Unable to load chats')
    });
  }

  selectChat(chat: ChatRoom): void {
    this.selectedChat = chat;
    this.loadMessages();
  }

  loadMessages(): void {
    if (!this.selectedChat) return;
    this.chatService.getTeamMessages(Number(this.selectedChat.id), 0, 100).subscribe({
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

  onNewChatRoom(): void {
    alert('Create a team from Teams Management to create a team chat.');
  }

  onSendMessage(content: string): void {
    if (!this.selectedChat || !content.trim()) return;
    this.chatService.sendMessage({
      teamId: Number(this.selectedChat.id),
      content: content.trim(),
      messageType: 'CHAT'
    }).subscribe({
      next: () => this.loadMessages(),
      error: error => alert(error.error?.message ?? 'Unable to send message')
    });
  }
}
