import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // 1) Board
  getBoards(): Observable<any> {
    return this.http.get(`${this.baseUrl}/boards`);
  }

  createBoard(name: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/boards`, { name });
  }

  deleteBoard(boardId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/boards/${boardId}`);
  }

  // 2) Task
  getTasks(boardId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/boards/${boardId}/tasks`);
  }

  createTask(boardId: number, title: string, description: string, status: string = 'todo'): Observable<any> {
    return this.http.post(`${this.baseUrl}/tasks`, { boardId, title, description, status });
  }

  updateTask(taskId: number, title: string, description: string, status: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/tasks/${taskId}`, { title, description, status });
  }

  deleteTask(taskId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/tasks/${taskId}`);
  }
}
