import { Component } from '@angular/core';
import { CardInfoComponent } from "../card/card";

@Component({
  selector: 'app-database-section',
  templateUrl: './card-content.html',
  styleUrls: ['./card-content.css'],
  imports: [CardInfoComponent]
})
export class DatabaseSectionComponent {}
