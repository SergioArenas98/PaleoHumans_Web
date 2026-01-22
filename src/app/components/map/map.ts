import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  PLATFORM_ID,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Site } from '../../models/Site';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.html',
  styleUrls: ['./map.css']
})
export class MapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() sites: Site[] = [];

  @ViewChild('mapEl', { static: true }) mapEl!: ElementRef<HTMLDivElement>;

  private readonly isBrowser: boolean;

  private map: any;
  private cluster: any;
  private L: any;

  private resizeObs?: ResizeObserver;
  private initDone = false;

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    private readonly router: Router
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  async ngAfterViewInit(): Promise<void> {
    if (!this.isBrowser) return;

    await this.init();
    this.render();

    this.resizeObs = new ResizeObserver(() => {
      if (this.map) this.map.invalidateSize();
    });
    this.resizeObs.observe(this.mapEl.nativeElement);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.isBrowser) return;
    if (!this.initDone) return;

    if (changes['sites']) {
      this.render();
    }
  }

  private async init(): Promise<void> {
    if (this.initDone) return;

    const Leaflet = await import('leaflet');
    const L = (Leaflet as any).default ?? Leaflet;
    await import('leaflet.markercluster');

    this.L = L;

    this.map = L.map(this.mapEl.nativeElement, {
      zoomControl: false,
      attributionControl: false
    }).setView([48.5, 12.0], 4);

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18
    }).addTo(this.map);

    this.cluster = (L as any).markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      maxClusterRadius: 46
    });

    this.map.addLayer(this.cluster);

    this.initDone = true;

    // importante: en layouts con cards, esto evita el “blanco”
    queueMicrotask(() => {
      if (this.map) this.map.invalidateSize();
    });
    setTimeout(() => {
      if (this.map) this.map.invalidateSize();
    }, 80);
  }

  private toNumber(v: any): number {
    if (typeof v === 'number') return v;
    if (typeof v === 'string') {
      const parsed = parseFloat(v.replace(',', '.'));
      return Number.isFinite(parsed) ? parsed : NaN;
    }
    return NaN;
  }

  private escapeHtml(input: string): string {
    return (input ?? '')
      .toString()
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  private render(): void {
    if (!this.map || !this.cluster || !this.L) return;

    const L = this.L;

    this.cluster.clearLayers();

    const bounds: any[] = [];

    for (const s of this.sites ?? []) {
      const lat = this.toNumber((s as any).latitude);
      const lon = this.toNumber((s as any).longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

      const siteId = (s as any).siteId;
      const title = (s.siteName ?? 'Unnamed site').toString();

      const municipality = ((s as any).municipality ?? '').toString().trim();
      const region = ((s as any).region ?? '').toString().trim();
      const country = ((s as any).country ?? '').toString().trim();

      const safeTitle = this.escapeHtml(title);
      const safeCountry = this.escapeHtml(country);
      const safeMunicipality = this.escapeHtml(municipality);
      const safeRegion = this.escapeHtml(region);

      const locationLine = [safeMunicipality, safeRegion].filter(Boolean).join(' · ');

      const marker = L.marker([lat, lon], {
        icon: L.divIcon({
          className: 'ph-pin',
          html: '<span class="ph-pin__shape"></span><span class="ph-pin__core"></span>',
          iconSize: [26, 34],
          iconAnchor: [13, 34],
          popupAnchor: [0, -30]
        })
      });

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

        const openBtn = el.querySelector<HTMLButtonElement>('[data-action="open"]');
        if (openBtn) {
          openBtn.onclick = () => {
            const idAttr = openBtn.getAttribute('data-id');
            const id = idAttr ? Number(idAttr) : NaN;

            if (Number.isFinite(id)) {
              this.router.navigateByUrl(`/site/${id}`);
              return;
            }
            this.router.navigateByUrl('/sites');
          };
        }

        const browseBtn = el.querySelector<HTMLButtonElement>('[data-action="browse"]');
        if (browseBtn) {
          browseBtn.onclick = () => this.router.navigateByUrl('/sites');
        }
      });

      this.cluster.addLayer(marker);
      bounds.push([lat, lon]);
    }

    if (bounds.length) {
      this.map.fitBounds(bounds, { padding: [26, 26] });
    } else {
      this.map.setView([48.5, 12.0], 4);
    }

    // por si el render ocurre justo tras un cambio de layout
    setTimeout(() => {
      if (this.map) this.map.invalidateSize();
    }, 60);
  }

  ngOnDestroy(): void {
    if (this.resizeObs) {
      this.resizeObs.disconnect();
      this.resizeObs = undefined;
    }

    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}
