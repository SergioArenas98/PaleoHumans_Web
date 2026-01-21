import { Injectable } from '@angular/core';
import { OsteologicalUnit } from '../models/OsteologicalUnit';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class OsteologicalUnitService {
  private baseUrl = 'http://localhost:8080/osteological-units';

  constructor(private http: HttpClient) {}

  getAllUnits(): Observable<OsteologicalUnit[]> {
    return this.http.get<OsteologicalUnit[]>(`${this.baseUrl}/getAll`);
  }

  getUnitById(id: number): Observable<OsteologicalUnit> {
    return this.http.get<OsteologicalUnit>(`${this.baseUrl}/${id}`);
  }

  getUnitsBySiteId(siteId: number): Observable<OsteologicalUnit[]> {
    return this.http.get<OsteologicalUnit[]>(`${this.baseUrl}/site/${siteId}`);
  }

  addUnit(unit: OsteologicalUnit): Observable<OsteologicalUnit> {
    return this.http.post<OsteologicalUnit>(this.baseUrl, unit);
  }
}