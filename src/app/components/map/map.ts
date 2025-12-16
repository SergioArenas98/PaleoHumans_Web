import { Component, Input, OnInit, AfterViewInit, OnDestroy, Inject, PLATFORM_ID, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.html',
  styleUrl: './map.css'
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  
  @Input() latitude!: number | string; 
  @Input() longitude!: number | string;
  @Input() siteName!: string;

  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  private map: any;
  private isBrowser: boolean;
  private lat: number = 0;
  private lon: number = 0;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId); 
  }
  
  ngOnInit(): void {

    this.lat = this.cleanAndParse(this.latitude);
    this.lon = this.cleanAndParse(this.longitude);

    if (this.lat === 0 || this.lon === 0) {
      console.error("Invalid or zero coordinates after cleaning. Map will not load.");
    }
  }

  private cleanAndParse(value: number | string): number {
    if (typeof value === 'number') {
      return value;
    }
    if (typeof value === 'string') {
      const cleanedValue = value.replace(',', '.');
      const parsedValue = parseFloat(cleanedValue);
      return isNaN(parsedValue) ? 0 : parsedValue;
    }
    return 0;
  }

  ngAfterViewInit(): void {
    if (this.isBrowser && this.lat !== 0 && this.lon !== 0) {
        this.initMap();
    }
  }

  private async initMap(): Promise<void> {
    const L = await import('leaflet');

    delete (L as any).Marker.prototype.options.icon;
    
    const iconDefault = L.icon({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
    
    L.Marker.prototype.options.icon = iconDefault;

    this.map = L.map(this.mapContainer.nativeElement, {
            center: [this.lat, this.lon], 
            zoom: 5
        });

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map);

    const marker = L.marker([this.lat, this.lon]).addTo(this.map);
    
    marker.bindPopup(`<b>${this.siteName}</b>`).openPopup();

    setTimeout(() => this.map.invalidateSize(), 100);
    }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }
}