import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Specimen } from '../models/Specimen';

@Injectable({
  providedIn: 'root',
})
export class SpecimenService {

  private baseUrl = 'http://localhost:8080/specimens'; 
  
  constructor(private http: HttpClient) {}
  
  getAllSpecimens(): Observable<Specimen[]> {
    return this.http.get<Specimen[]>(`${this.baseUrl}/getAll`);
  }
  
}
