import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from "../../components/header/header";
import { FooterComponent } from "../../components/footer/footer";
import { Site } from '../../models/Site';
import { SiteService } from '../../services/site-service';
import { MapClusterComponent } from "../../components/map-cluster/map-cluster";

@Component({
  selector: 'app-map-page',
  templateUrl: './map-page.html',
  styleUrls: ['./map-page.css'],
  imports: [CommonModule, HeaderComponent, FooterComponent, MapClusterComponent]
})
export class MapPage implements OnInit {
  
  sites: Site[] = [];
  isLoading = true;

  constructor(
    private siteService: SiteService) { }

  ngOnInit(): void {
    this.loadSites();
  }

  loadSites(): void {
    this.siteService.getAllSites().subscribe({
      next: (data: Site[]) => {
        this.sites = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading sites:', err);
        this.isLoading = false;
      }
    });
  };
}