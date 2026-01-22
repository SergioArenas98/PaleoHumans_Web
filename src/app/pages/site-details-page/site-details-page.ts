import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SiteService } from '../../services/site-service';
import { OsteologicalUnitService } from '../../services/osteological-unit-service';
import { Site } from '../../models/Site';
import { UnitType } from '../../models/UnitType';
import { OsteologicalUnit } from '../../models/OsteologicalUnit';
import { HeaderComponent } from "../../components/header/header";
import { FooterComponent } from "../../components/footer/footer";
import { SiteLocationMapComponent } from "../../components/site-location-map/site-location-map";

@Component({
  selector: 'app-site-details-page',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, RouterModule, SiteLocationMapComponent],
  templateUrl: './site-details-page.html',
  styleUrl: './site-details-page.css'
})
export class SiteDetailsPage implements OnInit {

  site: Site | undefined;

  activeSection = 'overview';

  private sectionObserver?: IntersectionObserver;

  groupedUnits: { [key in UnitType]?: OsteologicalUnit[] } = {};
  unitTypes = Object.values(UnitType);

  isLoading = true;
  errorMessage: string | undefined;

  constructor(
    private route: ActivatedRoute,
    private siteService: SiteService,
    private unitService: OsteologicalUnitService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam) {
      this.errorMessage = "Site ID is missing.";
      this.isLoading = false;
      return;
    }

    const siteId = Number(idParam);

    this.siteService.getSiteById(siteId).subscribe({
      next: (siteData) => {
        this.site = siteData;
        this.loadUnits(siteId);

        setTimeout(() => {
          this.setupScrollSpy();
        }, 100);
      },
      error: () => this.handleError("Error loading site details.")
    });
  }

  ngAfterViewInit(): void {
    queueMicrotask(() => this.setupScrollSpy());
  }

  ngOnDestroy(): void {
    this.sectionObserver?.disconnect();
  }

  scrollTo(id: string): void {
    const el = document.getElementById(id);
    if (!el) return;
    this.activeSection = id;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private setupScrollSpy(): void {
    const ids = ['overview', 'stats', 'osteology', 'bibliography', 'media'];
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((x): x is HTMLElement => !!x);

    if (sections.length === 0) return;

    this.sectionObserver?.disconnect();

    this.sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Si la sección está entrando en la mitad superior de la pantalla
          if (entry.isIntersecting) {
            this.activeSection = entry.target.id;
          }
        });
      },
      {
        // Marcamos como "activa" cuando la sección ocupa la parte superior
        rootMargin: '-10% 0px -80% 0px',
        threshold: 0
      }
    );

    sections.forEach((s) => this.sectionObserver!.observe(s));
  }

  /* ---------- Computed stats for the UI ---------- */
  get totalUnits(): number {
    return Object.values(this.groupedUnits).reduce((acc, list) => acc + (list?.length ?? 0), 0);
  }

  get individualsCount(): number {
    const list = this.groupedUnits[UnitType.INDIVIDUAL];
    return list?.length ?? 0;
  }

  get unitTypeCount(): number {
    return Object.entries(this.groupedUnits).filter(([, list]) => (list?.length ?? 0) > 0).length;
  }

  get maxMni(): number {
    let max = 0;

    Object.entries(this.groupedUnits).forEach(([key, list]) => {
      if (!list?.length) return;
      if (key === UnitType.INDIVIDUAL) return;

      for (const u of list) {
        const n = Number(u.mniStatistical ?? 0);
        if (!Number.isNaN(n)) max = Math.max(max, n);
      }
    });

    return max;
  }

  /* ---------- Labels ---------- */
  getUnitTypeLabel(type: string): string {
    const unitType = type.toLowerCase();

    switch (unitType) {
      case 'individual':
        return 'Individuals';
      case 'mixed individuals':
        return 'Mixed Individuals';
      case 'unassigned assemblage':
        return 'Unidentified Bone Groups';
      default:
        return type
          .replace(/_/g, ' ')
          .toLowerCase()
          .replace(/\b\w/g, l => l.toUpperCase());
    }
  }

  /* ---------- Navigation ---------- */
  goToUnit(unitId: number) {
    this.router.navigate(['/unit', unitId]);
  }

  goToSites(): void {
    this.router.navigate(['/sites']);
  }

  /* ---------- Actions (placeholders) ---------- */
  exportSite(): void {
    if (!this.site) return;

    // 1. Definir las cabeceras del CSV
    const headers = [
      'Site Name', 'Country', 'Region', 'Unit Type', 
      'Context', 'MNI', 'Individual Name', 'Age', 'Sex'
    ];

    // 2. Construir las filas de datos
    const rows: string[][] = [];

    // Recorremos todas las unidades agrupadas para aplanarlas en la tabla
    Object.entries(this.groupedUnits).forEach(([type, units]) => {
      units?.forEach(unit => {
        const row = [
          this.site?.siteName || '',
          this.site?.country || '',
          this.site?.region || '',
          type,
          unit.stratigraphicContext || '',
          unit.mniStatistical?.toString() || '0',
          unit.individuals?.[0]?.individualName || '',
          unit.individuals?.[0]?.ageAtDeath || '',
          unit.individuals?.[0]?.sex || ''
        ];
        rows.push(row);
      });
    });

    // 3. Convertir a formato CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val}"`).join(','))
    ].join('\n');

    // 4. Crear el archivo y disparar la descarga
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `export_${this.site.siteName.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Añade esta variable en la clase
showExportMenu = false;

exportAs(format: 'csv' | 'json' | 'geojson'): void {
  if (!this.site) return;
  this.showExportMenu = false; // Cerramos el menú al elegir

  let blob: Blob;
  let fileName: string;

  switch (format) {
    case 'json':
      const jsonData = { site: this.site, units: this.groupedUnits };
      blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      fileName = `${this.site.siteName}_data.json`;
      break;

    case 'geojson':
      const geoJson = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [this.site.longitude, this.site.latitude]
        },
        properties: { name: this.site.siteName, region: this.site.region }
      };
      blob = new Blob([JSON.stringify(geoJson, null, 2)], { type: 'application/geo+json' });
      fileName = `${this.site.siteName}_map.geojson`;
      break;

    case 'csv':
    default:
      // Reutilizamos la lógica de aplanado para CSV
      const headers = ['Site', 'Unit Type', 'Context', 'MNI', 'Individual', 'Age', 'Sex'];
      const rows: string[] = [];
      Object.entries(this.groupedUnits).forEach(([type, units]) => {
        units?.forEach(u => {
          rows.push([
            this.site?.siteName, type, u.stratigraphicContext || '', u.mniStatistical || '',
            u.individuals?.[0]?.individualName || '', u.individuals?.[0]?.ageAtDeath || '', 
            u.individuals?.[0]?.sex || ''
          ].map(v => `"${v}"`).join(','));
        });
      });
      blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv' });
      fileName = `${this.site.siteName}_units.csv`;
      break;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName.replace(/\s+/g, '_');
  link.click();
}

  shareSite(): void {
    const shareData = {
      title: this.site?.siteName || 'Detalles del Sitio',
      text: `Explora los datos osteológicos de ${this.site?.siteName}`,
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData)
        .then(() => console.log('Contenido compartido con éxito'))
        .catch((err) => console.error('Error al compartir:', err));
    } 
    else {
      navigator.clipboard.writeText(shareData.url).then(() => {
        // Aquí podrías disparar un "toast" o notificación
        alert('Enlace copiado al portapapeles');
      }).catch(err => {
        console.error('No se pudo copiar:', err);
      });
    }
  }

  /* ---------- Data loading ---------- */
  private loadUnits(siteId: number) {
    this.unitService.getAllUnits().subscribe({
      next: (allUnits: OsteologicalUnit[]) => {
        const siteUnits = allUnits.filter(u => u.site?.siteId === siteId);

        this.groupedUnits = {};

        siteUnits.forEach((unit: OsteologicalUnit) => {
          const type = unit.unitType;
          if (!this.groupedUnits[type]) this.groupedUnits[type] = [];
          this.groupedUnits[type]?.push(unit);
        });

        // Sort units in a stable, readable way
        Object.keys(this.groupedUnits).forEach(key => {
          const typeKey = key as UnitType;
          const units = this.groupedUnits[typeKey];
          if (!units) return;

          units.sort((a, b) => {
            if (typeKey === UnitType.INDIVIDUAL) {
              const nameA = a.individuals?.[0]?.individualName || '';
              const nameB = b.individuals?.[0]?.individualName || '';
              return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
            }

            const valA = a.stratigraphicContext ?? '';
            const valB = b.stratigraphicContext ?? '';
            return valA.localeCompare(valB, undefined, { numeric: true });
          });
        });

        this.isLoading = false;
      },
      error: () => this.handleError("Error loading osteological units.")
    });
  }

  private handleError(message: string) {
    this.errorMessage = message;
    this.isLoading = false;
    console.error(message);
  }
}
