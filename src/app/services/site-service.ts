import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
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

  getSiteById(id: number): Observable<Site> {
    return this.http.get<Site>(`${this.baseUrl}/${id}`).pipe(
      catchError(error => {
        throw error;
      })
    );
  }
  
}
