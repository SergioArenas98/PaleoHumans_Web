import { Component, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SiteService } from '../../services/site-service';
import { IndividualService } from '../../services/individual-service';
import { BoneService } from '../../services/bone-service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './hero.html',
  styleUrls: ['./hero.css']
})
export class HeroComponent implements OnInit {
  siteCount$!: Observable<number>;
  individualCount$!: Observable<number>;
  boneCount$!: Observable<number>;

  constructor(
    private readonly siteService: SiteService,
    private readonly individualService: IndividualService,
    private readonly boneService: BoneService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.siteCount$ = this.siteService.getAllSites().pipe(map(sites => sites.length));
    this.individualCount$ = this.individualService.getAllIndividuals().pipe(map(individuals => individuals.length));
    this.boneCount$ = this.boneService.getAllBones().pipe(map(bones => bones.length));
  }

  goToSites(): void {
    this.router.navigate(['/sites']);
  }

  goToMap(): void {
    this.router.navigate(['/map']);
  }

  goToDocs(): void {
    // Cambia esta ruta si tienes una página real de docs.
    this.router.navigate(['/methodology']);
  }
}
