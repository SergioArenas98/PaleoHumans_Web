import { Component, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IndividualService } from '../../services/individual-service';
import { SiteService } from '../../services/site-service';
import { BoneService } from '../../services/bone-service';

type StatCard = {
  label: string;
  value$: Observable<number>;
  icon: string;
};

@Component({
  selector: 'app-home-stats',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './home-stats.html',
  styleUrls: ['./home-stats.css']
})
export class HomeStatsComponent implements OnInit {
  cards: StatCard[] = [];

  constructor(
    private readonly siteService: SiteService,
    private readonly individualService: IndividualService,
    private readonly boneService: BoneService
  ) {}

  ngOnInit(): void {
    const sites$ = this.siteService.getAllSites().pipe(map(s => s.length));
    const individuals$ = this.individualService.getAllIndividuals().pipe(map(i => i.length));
    const bones$ = this.boneService.getAllBones().pipe(map(b => b.length));

    const countries$ = this.siteService.getAllSites().pipe(
      map(sites => {
        const set = new Set<string>();
        for (const s of sites as any[]) {
          if (s?.country) set.add(String(s.country));
        }
        return set.size;
      })
    );

    this.cards = [
      { label: 'Sites', value$: sites$, icon: 'location_on' },
      { label: 'Individuals', value$: individuals$, icon: 'groups' },
      { label: 'Bones', value$: bones$, icon: 'pet_supplies' },
      { label: 'Countries', value$: countries$, icon: 'public' }
    ];
  }
}
