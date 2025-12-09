import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Site } from '../models/Site';

@Injectable({
  providedIn: 'root',
})
export class SiteService {

  private baseUrl = 'http://localhost:8080/sites';

  constructor(private http: HttpClient) {}

  getAllSites(): Observable<Site[]> {
    return this.http.get<Site[]>(`${this.baseUrl}/getAll`);
  }
  
}
