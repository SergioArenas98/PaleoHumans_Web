import { Component, signal } from '@angular/core';
import { PaleoDataList } from "./components/site-list/paleo-data-list";


@Component({
  selector: 'app-root',
  imports: [PaleoDataList],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
}
