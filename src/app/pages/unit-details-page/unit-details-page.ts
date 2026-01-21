import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';
import { OsteologicalUnitService } from '../../services/osteological-unit-service'; // Usamos este
import { SpecimenService } from '../../services/specimen-service';
import { OsteologicalUnit } from '../../models/OsteologicalUnit';
import { Specimen } from '../../models/Specimen';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-unit-details-page',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './unit-details-page.html',
  styleUrls: ['./unit-details-page.css']
})
export class UnitDetailsPage implements OnInit {
  
  unitId: number | null = null;
  unit: OsteologicalUnit | undefined; // Ahora manejamos la unidad completa
  specimens: Specimen[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private unitService: OsteologicalUnitService, // Inyectamos servicio de unidad
    private specimenService: SpecimenService,
    private location: Location
  ) {}
  
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idStr = params.get('id');
      if (idStr) {
        this.unitId = +idStr; 
        this.loadUnitDetails(this.unitId);
      } else {
        this.errorMessage = "Unit ID not found in URL.";
        this.isLoading = false;
      }
    });
  }

  loadUnitDetails(unitId: number): void {
    this.isLoading = true;
    this.errorMessage = null;

    forkJoin({
      unit: this.unitService.getUnitById(unitId),
      specimens: this.specimenService.getSpecimensByUnitId(unitId)
    }).subscribe({
      next: (data) => {
        this.unit = data.unit;
        this.specimens = data.specimens;
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error loading unit details:", err);
        this.errorMessage = "Could not load osteological unit details.";
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.location.back();
  }
}