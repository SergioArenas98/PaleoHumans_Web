import { Component } from '@angular/core';
import { HeaderComponent } from "../../components/header/header";
import { HeroComponent } from "../../components/hero/hero";
import { DatabaseSectionComponent } from "../../components/explore-database/explore-database";

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.html',
  styleUrls: ['./home-page.css'],
  imports: [HeaderComponent, HeroComponent, DatabaseSectionComponent]
})
export class HomePage {}
