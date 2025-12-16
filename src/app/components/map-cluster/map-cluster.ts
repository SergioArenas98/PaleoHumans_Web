import { Component, Input, AfterViewInit, OnDestroy, Inject, PLATFORM_ID, ViewChild, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Site } from '../../models/Site';

@Component({
  selector: 'app-map-cluster',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-cluster.html',
  styleUrl: './map-cluster.css'
})
export class MapClusterComponent implements AfterViewInit, OnDestroy, OnChanges {
  
  @Input() sites: Site[] = []; 

  @ViewChild('clusterMapContainer', { static: true }) mapContainer!: ElementRef;

  private map: any;
  private isBrowser: boolean;
  private defaultLat: number = 47.8566; 
  private defaultLon: number = 20.3522;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId); 
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sites'] && this.sites.length > 0 && this.map) {
      this.clearAndAddMarkers();
    } else if (changes['sites'] && this.sites.length > 0 && this.isBrowser && !this.map) {
        this.initMap(); 
    }
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
        this.initMap();
    }
  }

  private cleanAndParse(value: number | string): number {
    if (typeof value === 'number') { return value; }
    if (typeof value === 'string') {
      const cleanedValue = value.replace(',', '.');
      const parsedValue = parseFloat(cleanedValue);
      return isNaN(parsedValue) ? 0 : parsedValue;
    }
    return 0;
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
            center: [this.defaultLat, this.defaultLon], 
            zoom: 4
        });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);

    if (this.sites.length > 0) {
        this.addMarkers(this.sites);
    }
    
    setTimeout(() => this.map.invalidateSize(), 100);
  }
  
  private clearAndAddMarkers(): void {
      this.addMarkers(this.sites);
  }

    private addMarkers(sites: Site[]): void {
      const L = (window as any).L; 
      sites.forEach(site => {
          const lat = this.cleanAndParse(site.latitude);
          const lon = this.cleanAndParse(site.longitude);
          if (lat !== 0 && lon !== 0) {
              const marker = L.marker([lat, lon]).addTo(this.map);
              
              const popupContent = `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 4px 0; min-width: 180px;">
                  <div style="font-size: 16px; font-weight: 600; color: #2a2a2a; margin-bottom: 10px;">
                    ${site.site}
                  </div>
                  <div style="font-size: 13px; line-height: 1.7;">
                    <div style="margin-bottom: 4px;">
                      <span style="color: #9c6b3f; font-weight: 500;">Municipality:</span>
                      <span style="color: #4a4a4a; margin-left: 4px;">${site.municipality}</span>
                    </div>
                    <div style="margin-bottom: 4px;">
                      <span style="color: #9c6b3f; font-weight: 500;">Region:</span>
                      <span style="color: #4a4a4a; margin-left: 4px;">${site.region}</span>
                    </div>
                    <div>
                      <span style="color: #9c6b3f; font-weight: 500;">Country:</span>
                      <span style="color: #4a4a4a; margin-left: 4px;">${site.country}</span>
                    </div>
                  </div>
                </div>
              `;
              
              marker.bindPopup(popupContent);
          }
      });
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }
}