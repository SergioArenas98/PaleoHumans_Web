import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { IndividualService } from '../../services/individual-service';
import { SiteService } from '../../services/site-service';
import { BoneService } from '../../services/bone-service';
import { SpecimenService } from '../../services/specimen-service';
import { Site } from '../../models/Site';
import { Individual } from '../../models/Individual';
import { Bone } from '../../models/Bone';
import { Specimen } from '../../models/Specimen';


@Component({
  selector: 'app-paleo-data-list',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './paleo-data-list.html',
  styleUrl: './paleo-data-list.css',
  providers: [SiteService, IndividualService, BoneService, SpecimenService]
})
export class PaleoDataList implements OnInit {

  sites: Site[] = [];
  individuals: Individual[] = [];
  bones: Bone[] = [];
  specimens: Specimen[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;

  constructor(
    private siteService: SiteService,
    private individualService: IndividualService,
    private boneService: BoneService,
    private specimenService: SpecimenService
  ) { }

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    const requests = {
      sites: this.siteService.getAllSites().pipe(catchError(err => of([]))),
      individuals: this.individualService.getAllIndividuals().pipe(catchError(err => of([]))),
      bones: this.boneService.getAllBones().pipe(catchError(err => of([]))),
      specimens: this.specimenService.getAllSpecimens().pipe(catchError(err => of([])))
    };

    forkJoin(requests)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (results) => {
          this.sites = results.sites;
          this.individuals = results.individuals;
          this.bones = results.bones;
          this.specimens = results.specimens;

          if (this.sites.length + this.individuals.length + this.bones.length + this.specimens.length === 0) {
              this.errorMessage = 'No se pudo cargar ningún dato. Verifica la conexión con el backend.';
          }
        },
        error: (err) => {
          this.errorMessage = 'Hubo un error general al cargar los datos.';
          console.error('Error fatal de forkJoin:', err);
        }
      });
  }
}