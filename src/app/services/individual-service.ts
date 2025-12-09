import { Injectable } from '@angular/core';
import { Individual } from '../models/Individual';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class IndividualService {
  
  private baseUrl = 'http://localhost:8080/individuals'; 

  constructor(private http: HttpClient) {}

  getAllIndividuals(): Observable<Individual[]> {
    return this.http.get<Individual[]>(`${this.baseUrl}/getAll`);
  }
  
}
