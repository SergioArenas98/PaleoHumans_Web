import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, ViewportScroller } from '@angular/common';
import { SiteService } from '../../services/site-service';
import { IndividualService } from '../../services/individual-service';
import { Site } from '../../models/Site';
import { Individual } from '../../models/Individual';
import { HeaderComponent } from "../../components/header/header";
import { FooterComponent } from "../../components/footer/footer";
import { switchMap } from 'rxjs/operators';
import { IndividualTable } from '../../components/individual-table/individual-table';
import { MapComponent } from '../../components/map/map';

@Component({
  selector: 'app-site-details-page',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, RouterModule, IndividualTable, MapComponent], 
  templateUrl: './site-details-page.html',
  styleUrl: './site-details-page.css'
})
export class SiteDetailsPage implements OnInit {
  
  site: Site | undefined;
  individuals: Individual[] = [];
  isLoading: boolean = true;
  errorMessage: string | undefined;

  constructor(
    private route: ActivatedRoute,
    private siteService: SiteService,
    private individualService: IndividualService,
    private router: Router,
    private viewportScroller: ViewportScroller
  ) {}

  ngOnInit(): void {

    this.viewportScroller.scrollToPosition([0, 0]);

    this.route.paramMap.pipe(
      switchMap(params => {
        const idParam = params.get('id');
        if (idParam && !isNaN(+idParam)) {
          const siteId = +idParam;
          return this.siteService.getSiteById(siteId);
        }
        return new Promise<Site | undefined>(resolve => resolve(undefined)).then(() => {});
      })
    ).subscribe({
      next: (siteData) => {
        if (siteData) {
          this.site = siteData;
          
          this.individualService.getIndividualsBySiteId(siteData.id).subscribe({
            next: (individualsData) => {
              
              this.individuals = individualsData.sort((a, b) => {
                const idA = a.individualId ? String(a.individualId).toUpperCase() : '';
                const idB = b.individualId ? String(b.individualId).toUpperCase() : '';
                
                if (idA < idB) {
                  return -1;
                }
                if (idA > idB) {
                  return 1;
                }
                return 0;
              });
              
              this.isLoading = false;
            },
            error: (err) => {
              console.error("Error loading individuals:", err);
              this.errorMessage = "Error loading associated individuals.";
              this.isLoading = false;
            }
          });
          
        } else {
          this.errorMessage = "Site ID is missing or invalid.";
          this.isLoading = false;
        }
      },
      error: (err) => {
        this.errorMessage = "Error loading site details. Check API connection.";
        this.isLoading = false;
        console.error(err);
      }
    });
  }
  
  goToSites() {
    this.router.navigate(['/sites']);
  }
}