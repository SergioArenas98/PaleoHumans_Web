import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';
import { IndividualService } from '../../services/individual-service';
import { SpecimenService } from '../../services/specimen-service';
import { Individual } from '../../models/Individual';
import { Specimen } from '../../models/Specimen';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-individual-details-page',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './individual-details-page.html',
  styleUrls: ['./individual-details-page.css']
})
export class IndividualDetailsPage implements OnInit {
  
  individual: Individual | undefined;
  specimens: Specimen[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private individualService: IndividualService,
    private specimenService: SpecimenService,
    private location: Location
  ) {}
  
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const individualId = params.get('id');
      if (individualId) {
        this.loadIndividualDetails(+individualId);
      } else {
        this.errorMessage = "Individual ID not found in URL.";
        this.isLoading = false;
      }
    });
  }

  loadIndividualDetails(individualId: number): void {
    this.isLoading = true;
    this.errorMessage = null;

    // Cargar el individuo y sus especímenes en paralelo
    forkJoin({
      individual: this.individualService.getIndividualById(individualId),
      specimens: this.specimenService.getSpecimensByIndividualId(individualId)
    }).subscribe({
      next: (data) => {
        this.individual = data.individual;
        this.specimens = data.specimens;
        console.log('Individual loaded:', this.individual);
        console.log('Specimens loaded:', this.specimens);
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error loading individual details:", err);
        this.errorMessage = "Could not load individual details. Please try again.";
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

}