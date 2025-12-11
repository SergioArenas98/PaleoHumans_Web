import { Component } from '@angular/core';
import { HeaderComponent } from "../../components/header/header";
import { HeroComponent } from "../../components/hero/hero";
import { DatabaseSectionComponent } from "../../components/card-content/card-content";
import { AboutComponent } from "../../components/about/about";
import { FooterComponent } from "../../components/footer/footer";

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.html',
  styleUrls: ['./home-page.css'],
  imports: [HeaderComponent, HeroComponent, DatabaseSectionComponent, AboutComponent, FooterComponent]
})
export class HomePage {}
