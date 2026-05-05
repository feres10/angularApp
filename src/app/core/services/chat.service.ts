import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { RxStomp } from '@stomp/rx-stomp';
import { environment } from '../../../environments/environment';

export interface MessageRequest {
  content: string;
  teamId: number;
  messageType?: 'CHAT' | 'JOIN' | 'LEAVE';
}

export interface MessageResponse {
  id: number;
  content: string;
  sender: any;
  teamId: number;
  messageType: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}/chat`;
  private rxStomp: RxStomp | null = null;
  private messageSubject = new Subject<MessageResponse>();
  public message$ = this.messageSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeWebSocket();
  }

  /**
   * Initialize WebSocket connection
   */
  private initializeWebSocket(): void {
    this.rxStomp = new RxStomp();
    this.rxStomp.configure({
      brokerURL: environment.wsUrl,
      reconnectDelay: 200,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000
    });

    this.rxStomp.activate();
  }

  /**
   * Send a message to team chat
   */
  sendMessage(request: MessageRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/send`, request);
  }

  /**
   * Subscribe to team messages via WebSocket
   */
  subscribeToTeam(teamId: number): Observable<any> {
    if (!this.rxStomp || !this.rxStomp.connected) {
      console.warn('WebSocket not connected');
      return new Observable();
    }

    return this.rxStomp.watch(`/topic/team.${teamId}`);
  }

  /**
   * Send WebSocket message (real-time chat)
   */
  sendWebSocketMessage(teamId: number, content: string): void {
    if (!this.rxStomp || !this.rxStomp.connected) {
      console.warn('WebSocket not connected');
      return;
    }

    const messageRequest: MessageRequest = {
      content,
      teamId,
      messageType: 'CHAT'
    };

    this.rxStomp.publish({
      destination: `/app/chat.sendMessage/${teamId}`,
      body: JSON.stringify(messageRequest)
    });
  }

  /**
   * Notify team when user joins
   */
  joinTeam(teamId: number): void {
    if (!this.rxStomp || !this.rxStomp.connected) {
      console.warn('WebSocket not connected');
      return;
    }

    this.rxStomp.publish({
      destination: `/app/chat.joinUser/${teamId}`,
      body: JSON.stringify({ teamId })
    });
  }

  /**
   * Notify team when user leaves
   */
  leaveTeam(teamId: number): void {
    if (!this.rxStomp || !this.rxStomp.connected) {
      console.warn('WebSocket not connected');
      return;
    }

    this.rxStomp.publish({
      destination: `/app/chat.leaveUser/${teamId}`,
      body: JSON.stringify({ teamId })
    });
  }

  /**
   * Get team messages via REST API
   */
  getTeamMessages(teamId: number, page: number = 0, size: number = 50): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get(`${this.apiUrl}/team/${teamId}`, { params });
  }

  getAdminTeamChats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/teams`);
  }

  /**
   * Get message by ID
   */
  getMessageById(id: number): Observable<MessageResponse> {
    return this.http.get<MessageResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Delete message (Admin)
   */
  deleteMessage(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * Get team message count
   */
  getTeamMessageCount(teamId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/team/${teamId}/count`);
  }

  /**
   * Get messages between timestamps (Admin)
   */
  getMessagesBetween(teamId: number, start: string, end: string): Observable<any> {
    const params = new HttpParams()
      .set('start', start)
      .set('end', end);
    return this.http.get(`${this.apiUrl}/team/${teamId}/between`, { params });
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    if (this.rxStomp) {
      this.rxStomp.deactivate();
    }
  }
}
