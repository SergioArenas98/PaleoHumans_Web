import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SiteService } from '../../services/site-service';
import { IndividualService } from '../../services/individual-service';
import { BoneService } from '../../services/bone-service';
import { AsyncPipe } from '@angular/common';

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
    private boneService: BoneService
  ) {}

  ngOnInit() {
    // Obtiene todos los Sites y usa el operador map para obtener la longitud del array
    this.siteCount$ = this.siteService.getAllSites().pipe(
      map(sites => sites.length)
    );

    // Obtiene todos los Individuals y usa el operador map para obtener la longitud del array
    this.individualCount$ = this.individualService.getAllIndividuals().pipe(
      map(individuals => individuals.length)
    );

    // Obtiene todos los Bones y usa el operador map para obtener la longitud del array
    this.boneCount$ = this.boneService.getAllBones().pipe(
      map(bones => bones.length)
    );
  }
}