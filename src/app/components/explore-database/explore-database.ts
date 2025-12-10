import { Component } from '@angular/core';
import { CardInfoComponent } from "../card-info/card-info";

@Component({
  selector: 'app-database-section',
  templateUrl: './explore-database.html',
  styleUrls: ['./explore-database.css'],
  imports: [CardInfoComponent]
})
export class DatabaseSectionComponent {}
