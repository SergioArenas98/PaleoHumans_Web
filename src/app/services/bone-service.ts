import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Bone } from '../models/Bone';

@Injectable({
  providedIn: 'root',
})
export class BoneService {

  private baseUrl = 'http://localhost:8080/bones'; 

  constructor(private http: HttpClient) {}

  getAllBones(): Observable<Bone[]> {
    return this.http.get<Bone[]>(`${this.baseUrl}/getAll`);
  }
  
}
