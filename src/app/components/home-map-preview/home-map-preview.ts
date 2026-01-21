import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  PLATFORM_ID,
  ViewChild
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SiteService } from '../../services/site-service';

type SiteLite = {
  siteId?: number;
  siteName?: string;
  country?: string;
  latitude?: number | string;
  longitude?: number | string;
  id?: string | number;
  name?: string;
};


@Component({
  selector: 'app-home-map-preview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home-map-preview.html',
  styleUrls: ['./home-map-preview.css']
})
export class HomeMapPreviewComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapEl', { static: true }) mapEl!: ElementRef<HTMLDivElement>;

  private map: any;
  private markers: any;
  isBrowser = false;

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    private readonly siteService: SiteService,
    private readonly router: Router
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  async ngAfterViewInit(): Promise<void> {
    if (!this.isBrowser) return;

    const L = (await import('leaflet')).default;

    await import('leaflet.markercluster');

    delete (L as any).Marker.prototype.options.icon;
    (L as any).Marker.prototype.options.icon = L.icon({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41]
    });

    // Mapa base
    this.map = L.map(this.mapEl.nativeElement, {
      zoomControl: false,
      attributionControl: false
    }).setView([48.5, 12.0], 4);

    L.control
      .zoom({ position: 'bottomright' })
      .addTo(this.map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18
    }).addTo(this.map);

    this.markers = (L as any).markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      maxClusterRadius: 45
    });

    this.map.addLayer(this.markers);

    this.siteService.getAllSites().subscribe({
      next: (sites: any[]) => this.renderSites(L, sites as SiteLite[]),
      error: () => {
      }
    });

    setTimeout(() => this.map.invalidateSize(), 80);
  }

  private renderSites(L: any, sites: SiteLite[]): void {
    if (!this.map || !this.markers) return;

    this.markers.clearLayers();

    const bounds: any[] = [];

    for (const s of sites) {
      const lat = Number(s.latitude);
      const lon = Number(s.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

      const title = (s.siteName ?? s.name ?? 'Unnamed site').toString();
      const siteId = s.siteId ?? s.id;

      const country = (s.country || '').toString();

      const marker = L.marker([lat, lon], {
        icon: L.divIcon({
          className: 'ph-pin',
          html: '<span class="ph-pin__shape"></span><span class="ph-pin__core"></span>',
          iconSize: [26, 34],
          iconAnchor: [13, 34],
          popupAnchor: [0, -30]
        })
      });

      const safeTitle = this.escapeHtml(title);
      const safeCountry = this.escapeHtml(country);

      const popupHtml = `
        <div class="ph-popup">
          <div class="ph-popup__title">${safeTitle}</div>
          ${safeCountry ? `<div class="ph-popup__meta">${safeCountry}</div>` : ''}
          <div class="ph-popup__actions">
            <button class="ph-popup__btn" data-action="open">Open site</button>
            <button class="ph-popup__btn ph-popup__btn--ghost" data-action="browse">Browse</button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        closeButton: true,
        className: 'ph-leaflet-popup',
        autoPanPadding: [18, 18]
      });

      marker.on('popupopen', (evt: any) => {
        const el = evt.popup.getElement() as HTMLElement | null;
        if (!el) return;

        const btn = el.querySelector<HTMLButtonElement>('[data-action="open"]');
        if (!btn) return;

        btn.onclick = () => {
          if (siteId != null) {
            this.router.navigateByUrl(`/site/${siteId}`);
            return;
          }

          this.router.navigate(['/sites'], { queryParams: { q: title } });
        };


        const browse = el.querySelector<HTMLButtonElement>('[data-action="browse"]');
        if (browse) {
          browse.onclick = () => this.router.navigateByUrl('/sites');
        }
      });

      this.markers.addLayer(marker);
      bounds.push([lat, lon]);
    }

    if (bounds.length) {
      this.map.fitBounds(bounds, { padding: [24, 24] });
    }
  }

  private escapeHtml(input: string): string {
    return input
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}
