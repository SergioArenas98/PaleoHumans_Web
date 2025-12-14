import { Routes } from '@angular/router';
import { HomePage } from './pages/home-page/home-page';
import { MapPage } from './pages/map-page/map-page';
import { SitesPage } from './pages/sites-page/sites-page';
import { SiteDetailsPage } from './pages/site-details-page/site-details-page';
import { IndividualDetailsPage } from './pages/individual-details-page/individual-details-page';

export const routes: Routes = [
  
  { path: '', component: HomePage },
  { path: 'map', component: MapPage },
  { path: 'sites', component: SitesPage },
  { path: 'site/:id', component: SiteDetailsPage },
  { path: 'individual/:id', component: IndividualDetailsPage }
];