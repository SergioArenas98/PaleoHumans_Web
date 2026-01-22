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

type SiteLike = {
  siteId?: number | string;
  siteName?: string;
  country?: string;
  region?: string;
  municipality?: string;
  latitude?: number | string;
  longitude?: number | string;
};

@Component({
  selector: 'app-site-location-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './site-location-map.html',
  styleUrls: ['./site-location-map.css']
})
export class SiteLocationMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() site: SiteLike | null = null;

  @ViewChild('mapEl', { static: true }) mapEl!: ElementRef<HTMLDivElement>;

  private readonly isBrowser: boolean;
  private map: any;
  private marker: any;
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

    if (changes['site']) {
      this.render();
    }
  }

  private async init(): Promise<void> {
    if (this.initDone) return;

    const Leaflet = await import('leaflet');
    const L = (Leaflet as any).default ?? Leaflet;
    this.L = L;

    this.map = L.map(this.mapEl.nativeElement, {
    zoomControl: false,
    attributionControl: false,
    scrollWheelZoom: false,
    minZoom: 3,
    maxZoom: 17
    });

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18
    }).addTo(this.map);

    this.initDone = true;

    queueMicrotask(() => this.map?.invalidateSize());
    setTimeout(() => this.map?.invalidateSize(), 80);
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
    if (!this.map || !this.L) return;

    const s = this.site;
    const lat = this.toNumber(s?.latitude);
    const lon = this.toNumber(s?.longitude);

    // limpia marcador anterior
    if (this.marker) {
      this.marker.remove();
      this.marker = null;
    }

    // si no hay coords, centra Europa y listo
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      this.map.setView([48.5, 12.0], 4);
      setTimeout(() => this.map?.invalidateSize(), 60);
      return;
    }

    const L = this.L;

    this.marker = L.marker([lat, lon], {
    icon: this.L.divIcon({
        className: 'ph-pin',
        html: '<span class="ph-pin__shape"></span><span class="ph-pin__core"></span>',
        iconSize: [26, 34],
        iconAnchor: [13, 34],
        popupAnchor: [0, -30]
    })
    });

    this.marker.on('popupopen', (evt: any) => {
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

    this.marker.addTo(this.map);

    // zoom agradable para un punto
    this.map.setView([lat, lon], 6);
    setTimeout(() => this.map?.invalidateSize(), 60);
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
