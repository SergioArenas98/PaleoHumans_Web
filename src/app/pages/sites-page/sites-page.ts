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

type SortColumn = 'site' | 'country' | 'location' | 'individualCount';

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
  sortColumn: SortColumn = 'site';
  sortDirection: 'asc' | 'desc' = 'asc';
  countries: string[] = ['All Countries'];
  regions: string[] = ['All Regions'];

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
        const siteIndividualCounts = this.countIndividualsBySiteMap(individuals);

        this.allSites = sites.map(site => ({
          ...site,
          individualCount: siteIndividualCounts[site.siteId] || 0,
          specimenCount: 0
        }));

        this.calculateAvailableCountries();
        this.calculateAvailableRegions(); // NUEVO

        this.filteredSites = [...this.allSites];
        this.applyFilters();
        this.sortTable();

        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error al cargar datos del directorio de sitios:", err);
        this.isLoading = false;
      }
    });
  }

  trackBySiteId(index: number, site: any) {
    return site.siteId;
  }

  private calculateAvailableCountries(): void {
    const countrySet = new Set<string>();
    this.allSites.forEach(site => {
      countrySet.add(site.country);
    });
    this.countries = ['All Countries', ...Array.from(countrySet).sort()];
  }

  private countIndividualsBySiteMap(individuals: Individual[]): { [key: number]: number } {
    const counts: { [key: number]: number } = {};
    individuals.forEach(ind => {
      ind.osteologicalUnits?.forEach(ou => {
        const siteId = ou.site.siteId;
        counts[siteId] = (counts[siteId] || 0) + 1;
      });
    });
    return counts;
  }

  sortTable(column?: SortColumn): void {
    if (column) {
      if (this.sortColumn === column) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortColumn = column;
        this.sortDirection = 'asc';
      }
    }

    this.filteredSites.sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (this.sortColumn) {
        case 'site':
          valueA = a.siteName.toLowerCase();
          valueB = b.siteName.toLowerCase();
          break;
        case 'country':
          valueA = a.country.toLowerCase();
          valueB = b.country.toLowerCase();
          break;
        case 'location':
          valueA = `${a.municipality}, ${a.region}`.toLowerCase();
          valueB = `${b.municipality}, ${b.region}`.toLowerCase();
          break;
        case 'individualCount':
          valueA = a.individualCount;
          valueB = b.individualCount;
          break;
        default:
          return 0;
      }

      let comparison = 0;
      
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        comparison = valueA.localeCompare(valueB);
      } else if (typeof valueA === 'number' && typeof valueB === 'number') {
        comparison = valueA - valueB;
      }

      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  getSortIcon(column: SortColumn): string {
    if (this.sortColumn !== column) {
      return '↓';
    }
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  viewDetails(siteId: number): void {
    this.router.navigate(['/site', siteId]);
  }

    private calculateAvailableRegions(): void {
    const regionSet = new Set<string>();
    this.allSites.forEach(site => {
      if (site.region) regionSet.add(site.region);
    });
    this.regions = ['All Regions', ...Array.from(regionSet).sort()];
  }

  applyFilters(): void {
    let tempSites = [...this.allSites];

    if (this.searchTerm) {
      const lowerCaseTerm = this.searchTerm.toLowerCase();
      tempSites = tempSites.filter(site =>
        site.siteName.toLowerCase().includes(lowerCaseTerm)
      );
    }

    if (this.selectedCountry !== 'All Countries') {
      tempSites = tempSites.filter(site => site.country === this.selectedCountry);
    }

    if (this.selectedRegion !== 'All Regions') {
      tempSites = tempSites.filter(site => site.region === this.selectedRegion);
    }

    this.filteredSites = tempSites;
    this.sortTable();
  }
}