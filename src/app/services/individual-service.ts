import { Injectable } from '@angular/core';
import { Individual } from '../models/Individual';
import { catchError, Observable, of } from 'rxjs';
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

  getIndividualsBySiteId(siteId: number): Observable<Individual[]> {
    return this.http.get<Individual[]>(`${this.baseUrl}/site/${siteId}`).pipe(
      catchError((error) => {
        return of([]);
      })
    );
  }

  getIndividualById(id: number): Observable<Individual> {
    return this.http.get<Individual>(`${this.baseUrl}/${id}`).pipe(
      catchError((error) => {
        throw error;
      })
    );
  }
}
