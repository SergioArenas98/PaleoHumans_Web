import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SiteService } from '../../services/site-service';
import { OsteologicalUnitService } from '../../services/osteological-unit-service';
import { Site } from '../../models/Site';
import { UnitType } from '../../models/UnitType';
import { OsteologicalUnit } from '../../models/OsteologicalUnit';
import { HeaderComponent } from "../../components/header/header";
import { FooterComponent } from "../../components/footer/footer";

@Component({
  selector: 'app-site-details-page',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, RouterModule], 
  templateUrl: './site-details-page.html',
  styleUrl: './site-details-page.css'
})
export class SiteDetailsPage implements OnInit {
  
  site: Site | undefined;
  groupedUnits: { [key in UnitType]?: OsteologicalUnit[] } = {};
  unitTypes = Object.values(UnitType);
  isLoading: boolean = true;
  errorMessage: string | undefined;

  constructor(
    private route: ActivatedRoute,
    private siteService: SiteService,
    private unitService: OsteologicalUnitService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const siteId = Number(idParam);
      this.siteService.getSiteById(siteId).subscribe({
        next: (siteData) => {
          this.site = siteData;
          this.loadUnits(siteId);
        },
        error: (err) => this.handleError("Error loading site details.")
      });
    } else {
      this.errorMessage = "Site ID is missing.";
      this.isLoading = false;
    }
  }

  getUnitTypeLabel(type: string): string {
    const unitType = type.toLowerCase();

    switch (unitType) {
      case 'individual':
        return 'Individuals';
      case 'mixed individuals':
        return 'Mixed Individuals';
      case 'unassigned assemblage':
        return 'Unidentified Bone Groups';
      default:
        return type.replace(/_/g, ' ').toLowerCase()
                  .replace(/\b\w/g, l => l.toUpperCase());
    }
  }

  goToUnit(unitId: number) {
    this.router.navigate(['/unit', unitId]);
  }

  loadUnits(siteId: number) {
    this.unitService.getAllUnits().subscribe({
      next: (allUnits: OsteologicalUnit[]) => {
        const siteUnits = allUnits.filter(u => u.site.siteId === siteId);
        
        this.groupedUnits = {};
        
        siteUnits.forEach((unit: OsteologicalUnit) => {
          const type = unit.unitType;
          if (!this.groupedUnits[type]) {
            this.groupedUnits[type] = [];
          }
          this.groupedUnits[type]?.push(unit);
        });

        Object.keys(this.groupedUnits).forEach(key => {
          const typeKey = key as UnitType;
          const units = this.groupedUnits[typeKey];

          if (units) {
            units.sort((a, b) => {
              if (typeKey === UnitType.INDIVIDUAL) {
                const nameA = a.individuals?.[0]?.individualName || '';
                const nameB = b.individuals?.[0]?.individualName || '';
                
                return nameA.localeCompare(nameB, undefined, { 
                  numeric: true, 
                  sensitivity: 'base' 
                });
              }

              const valA = a.stratigraphicContext ?? '';
              const valB = b.stratigraphicContext ?? '';
              return valA.localeCompare(valB, undefined, { numeric: true });
            });
          }
        });

        this.isLoading = false;
      },
      error: (err) => this.handleError("Error loading osteological units.")
    });
  }

  // Creamos el método handleError que faltaba
  private handleError(message: string) {
    this.errorMessage = message;
    this.isLoading = false;
    console.error(message);
  }

  goToSites(): void {
    this.router.navigate(['/sites']);
  }
}