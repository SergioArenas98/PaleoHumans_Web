import { Component, OnInit } from '@angular/core';
import { Site } from '../../models/Site';
import { SiteService } from '../../services/site-service';
import { Individual } from '../../models/Individual';
import { IndividualService } from '../../services/individual-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderComponent } from "../../components/header/header";
import { FooterComponent } from "../../components/footer/footer";
import { forkJoin } from 'rxjs';

interface SiteWithCount extends Site {
  individualCount: number;
  specimenCount: number;
}

@Component({
  selector: 'app-sites-page',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './sites-page.html',
  styleUrls: ['./sites-page.css']
})
export class SitesPage implements OnInit {
  
  allSites: SiteWithCount[] = [];
  filteredSites: SiteWithCount[] = [];
  isLoading: boolean = true;
  searchTerm: string = '';
  selectedPhase: string = 'All Phases';
  selectedRegion: string = 'All Regions';
  selectedCountry: string = 'All Countries';

  countries: string[] = ['All Countries'];

  constructor(
    private siteService: SiteService,
    private individualService: IndividualService,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.isLoading = true;
    
    forkJoin({
      sites: this.siteService.getAllSites(),
      individuals: this.individualService.getAllIndividuals()
    }).subscribe({
      next: ({ sites, individuals }) => {
        
        const siteIndividualCounts = this.countIndividualsBySite(individuals);
        
        this.allSites = sites.map(site => ({
          ...site,
          individualCount: siteIndividualCounts[site.id] || 0,
          specimenCount: 0 
        }));
        
        this.calculateAvailableCountries();
        this.filteredSites = this.allSites;
        this.applyFilters();
        
        // ⬅️ CAMBIO CLAVE: SÓLO aquí marcamos que la carga ha terminado.
        this.isLoading = false; 
      },
      error: (err) => {
        console.error("Error al cargar datos del directorio de sitios:", err);
        // ⬅️ IMPORTANTE: También marcamos que la carga ha terminado en caso de error.
        this.isLoading = false; 
      }
    });
  }

  private calculateAvailableCountries(): void {
    const countrySet = new Set<string>();
    this.allSites.forEach(site => {
      countrySet.add(site.country);
    });
    this.countries = ['All Countries', ...Array.from(countrySet).sort()];
  }

  private countIndividualsBySite(individuals: Individual[]): { [siteId: number]: number } {
    const counts: { [siteId: number]: number } = {};
    for (const individual of individuals) {
      const siteId = individual.site.id;
      counts[siteId] = (counts[siteId] || 0) + 1;
    }
    return counts;
  }

  applyFilters(): void {
    let tempSites = this.allSites;

    if (this.searchTerm) {
      const lowerCaseTerm = this.searchTerm.toLowerCase();
      tempSites = tempSites.filter(site => 
        site.site.toLowerCase().includes(lowerCaseTerm)
      );
    }

    if (this.selectedCountry !== 'All Countries') {
        tempSites = tempSites.filter(site => site.country === this.selectedCountry);
    }

    this.filteredSites = tempSites;
  }

  viewDetails(siteId: number): void {
    this.router.navigate(['/sites', siteId]);
  }
}