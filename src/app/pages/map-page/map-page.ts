import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';

import { Site } from '../../models/Site';
import { SiteService } from '../../services/site-service';

import { MapComponent } from '../../components/map/map';

@Component({
  selector: 'app-map-page',
  standalone: true,
  templateUrl: './map-page.html',
  styleUrls: ['./map-page.css'],
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent, MapComponent]
})
export class MapPage implements OnInit {
  sites: Site[] = [];
  filteredSites: Site[] = [];

  isLoading = true;

  // filtros
  query = '';
  selectedCountry = 'All countries';
  countries: string[] = ['All countries'];

  constructor(private readonly siteService: SiteService) {}

  ngOnInit(): void {
    this.siteService.getAllSites().subscribe({
      next: (data: Site[]) => {
        this.sites = Array.isArray(data) ? data : [];
        this.countries = this.buildCountries(this.sites);
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading sites:', err);
        this.sites = [];
        this.filteredSites = [];
        this.countries = ['All countries'];
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    const q = this.query.trim().toLowerCase();
    const country = this.selectedCountry;

    this.filteredSites = (this.sites ?? []).filter((s) => {
      const matchesCountry =
        country === 'All countries' || (s.country ?? '').toString().trim() === country;

      if (!matchesCountry) return false;
      if (!q) return true;

      const hay = [
        s.siteName,
        s.municipality,
        s.region,
        s.country
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return hay.includes(q);
    });
  }

  clear(): void {
    this.query = '';
    this.selectedCountry = 'All countries';
    this.applyFilters();
  }

  private buildCountries(sites: Site[]): string[] {
    const set = new Set<string>();
    for (const s of sites ?? []) {
      const c = (s.country ?? '').toString().trim();
      if (c) set.add(c);
    }
    return ['All countries', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }
}
