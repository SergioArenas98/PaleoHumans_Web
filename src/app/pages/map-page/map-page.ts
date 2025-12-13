import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from "../../components/header/header";
import { FooterComponent } from "../../components/footer/footer";

@Component({
  selector: 'app-map-page',
  templateUrl: './map-page.html',
  styleUrls: ['./map-page.css'],
  imports: [HeaderComponent, FooterComponent]
})
export class MapPage implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}