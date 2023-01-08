import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay } from 'rxjs/operators';
import { User, UsersResp } from '../users';

const USER_BACKEND_URL = "https://dummyjson.com";

export interface SkipLimit {
  limit: number;
  skip: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private http: HttpClient
  ) { }

  getUsers({limit, skip = 0}: SkipLimit) {
    return this.http.get<UsersResp>(`${USER_BACKEND_URL}/users?limit=${limit}&skip=${skip}`);
  }

  deleteUser(id: number) {
    return this.http.delete(`${USER_BACKEND_URL}/users/${id}`);
  }
  editUser(id: number, user: User) {
    return this.http.put(`${USER_BACKEND_URL}/users/${id}`, user);
  }

  searchInUser(searchVlaue: string) {
    return this.http.get(`${USER_BACKEND_URL}/users/search?q=${searchVlaue}`).pipe(delay(1000));
  }
  
}
