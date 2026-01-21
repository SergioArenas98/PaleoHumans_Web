import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';
import { HeroComponent } from '../../components/hero/hero';
import { HomeStatsComponent } from '../../components/home-stats/home-stats';
import { HomeMapPreviewComponent } from '../../components/home-map-preview/home-map-preview';
import { HomeInfoGridComponent } from '../../components/home-info-grid/home-info-grid';
import { HomeUpdatesComponent } from '../../components/home-updates/home-updates';


@Component({
  selector: 'app-home-page',
  standalone: true,
  templateUrl: './home-page.html',
  styleUrls: ['./home-page.css'],
  imports: [
    HeaderComponent,
    FooterComponent,
    HomeStatsComponent,
    HomeMapPreviewComponent,
    HomeInfoGridComponent,
    HomeUpdatesComponent,
    HeroComponent
]
})
export class HomePage {}
