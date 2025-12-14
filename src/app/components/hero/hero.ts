import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SiteService } from '../../services/site-service';
import { IndividualService } from '../../services/individual-service';
import { BoneService } from '../../services/bone-service';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hero',
  imports: [AsyncPipe],
  templateUrl: './hero.html',
  styleUrls: ['./hero.css']
})
export class HeroComponent implements OnInit {

  siteCount$!: Observable<number>;
  individualCount$!: Observable<number>;
  boneCount$!: Observable<number>;

  constructor(
    private siteService: SiteService,
    private individualService: IndividualService,
    private boneService: BoneService,
    private router: Router
  ) {}

  ngOnInit() {
    this.siteCount$ = this.siteService.getAllSites().pipe(
      map(sites => sites.length)
    );

    this.individualCount$ = this.individualService.getAllIndividuals().pipe(
      map(individuals => individuals.length)
    );

    this.boneCount$ = this.boneService.getAllBones().pipe(
      map(bones => bones.length)
    );
  }

  navigateToMap() {
    this.router.navigate(['/map']);
  }

  navigateToSites() {
    this.router.navigate(['/sites']);
  }
}