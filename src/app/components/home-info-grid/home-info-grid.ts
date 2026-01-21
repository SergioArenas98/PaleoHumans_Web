import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-info-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-info-grid.html',
  styleUrls: ['./home-info-grid.css']
})
export class HomeInfoGridComponent {
  citation =
    'PaleoHumans Database (2026). European Upper Paleolithic Skeletal Remains Inventory, Version 1.0.0. ' +
    'http://paleohumans.org. Accessed [Date].';

  copied = false;

  async copyCitation(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.citation);
      this.copied = true;
      window.setTimeout(() => (this.copied = false), 1200);
    } catch {
      // Si clipboard falla (http o permisos), no hacemos drama: el usuario puede seleccionar y copiar.
      this.copied = false;
    }
  }
}
