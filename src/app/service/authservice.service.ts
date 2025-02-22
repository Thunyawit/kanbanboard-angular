import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, credentials);
  }

  register(data: { username: string; password: string; confirmPassword?: string }): Observable<any> {
    // ส่งเฉพาะ username กับ password ให้ backend
    return this.http.post(`${this.baseUrl}/register`, { username: data.username, password: data.password });
  }
}
