import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { HeaderComponent } from "../../components/header/header";
import { FooterComponent } from "../../components/footer/footer";

import { OsteologicalUnitService } from '../../services/osteological-unit-service';

import { OsteologicalUnit } from '../../models/OsteologicalUnit';
import { Specimen } from '../../models/Specimen';
import { Individual } from '../../models/Individual';
import { Bone } from '../../models/Bone';

type BoneRow = { bone: Bone; specimen: Specimen };

@Component({
  selector: 'app-unit-details-page',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, RouterModule],
  templateUrl: './unit-details-page.html',
  styleUrl: './unit-details-page.css'
})
export class UnitDetailsPage implements OnInit {

  unit: OsteologicalUnit | undefined;

  isLoading = true;
  errorMessage: string | undefined;

  showExportMenu = false;

  constructor(
    private route: ActivatedRoute,
    private unitService: OsteologicalUnitService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam) {
      this.errorMessage = "Unit ID is missing.";
      this.isLoading = false;
      return;
    }

    const unitId = Number(idParam);

    // Mantengo tu enfoque actual: cargar por listado y filtrar
    this.unitService.getAllUnits().subscribe({
      next: (allUnits: OsteologicalUnit[]) => {
        const found = allUnits.find(u => u.osteologicalUnitId === unitId);

        if (!found) {
          this.errorMessage = "Osteological unit not found.";
          this.isLoading = false;
          return;
        }

        this.unit = found;
        this.isLoading = false;
      },
      error: () => this.handleError("Error loading osteological unit details.")
    });
  }

  /* ---------- Navigation ---------- */
  goToSite(): void {
    const id = this.unit?.site?.siteId;
    if (!id) return;
    this.router.navigate(['/site', id]);
  }

  /* ---------- Core lists ---------- */
  get individuals(): Individual[] {
    return this.unit?.individuals ?? [];
  }

  get specimens(): Specimen[] {
    return this.unit?.specimens ?? [];
  }

  get boneRows(): BoneRow[] {
    const rows: BoneRow[] = [];
    for (const s of this.specimens) {
      for (const b of (s.bones ?? [])) {
        rows.push({ bone: b, specimen: s });
      }
    }
    return rows;
  }

  get bonesCount(): number {
    return this.boneRows.length;
  }

  /* ---------- Labels ---------- */
  get unitTypeLabel(): string {
    const t = (this.unit?.unitType ?? '').toString().toLowerCase();
    switch (t) {
      case 'isolated bone': return 'Isolated bone';
      case 'individual': return 'Individual';
      case 'unassigned assemblage': return 'Unassigned assemblage';
      case 'mixed individuals': return 'Mixed individuals';
      default: return this.unit?.unitType ?? '—';
    }
  }

  /* ---------- Individual title ---------- */
  private individualLabel(i: Individual): string {
    const name = (i.individualName ?? '').toString().trim();
    if (name) return name;

    const anyId =
      (i as any).individualCode ??
      (i as any).individualId ??
      (i as any).id;

    if (anyId !== undefined && anyId !== null && String(anyId).trim() !== '') {
      return `Individual ${anyId}`;
    }

    return 'Unassigned individual';
  }

  get primaryIndividualName(): string {
    if (!this.individuals.length) return 'Unassigned individual';
    const first = this.individualLabel(this.individuals[0]);
    const extra = this.individuals.length - 1;
    return extra > 0 ? `${first} +${extra}` : first;
  }

  /* ---------- Dating summaries ---------- */
  get datedSpecimens(): Specimen[] {
    return this.specimens.filter(s => !!(s.datesBpUncal ?? s.datesRange));
  }

  get hasDating(): boolean {
    return this.datedSpecimens.length > 0;
  }

  get bpUncalSummary(): string {
    const nums: number[] = [];
    for (const s of this.datedSpecimens) {
      const raw = s.datesBpUncal;
      if (raw === null || raw === undefined) continue;
      const n = Number(raw);
      if (!Number.isNaN(n)) nums.push(n);
    }
    if (!nums.length) return '—';
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    return min === max ? `${min} BP` : `${min}–${max} BP`;
  }

  get dateRangeSummary(): string {
    const ranges = this.datedSpecimens
      .map(s => String(s.datesRange ?? '').trim())
      .filter(Boolean);

    if (!ranges.length) return '—';
    if (ranges.length <= 2) return ranges.join(' · ');
    return `${ranges[0]} · ${ranges[1]} · +${ranges.length - 2}`;
  }

  get datingTechniqueSummary(): string {
    const set = new Set<string>();
    for (const s of this.datedSpecimens) {
      const v = (s.datingTechnique ?? '').trim();
      if (v) set.add(v);
    }
    return set.size ? Array.from(set).join(', ') : '—';
  }

  get datingMaterialSummary(): string {
    const set = new Set<string>();
    for (const s of this.datedSpecimens) {
      const v = (s.datingMaterial ?? '').trim();
      if (v) set.add(v);
    }
    return set.size ? Array.from(set).join(', ') : '—';
  }

  get repositorySummary(): string {
    const set = new Set<string>();
    for (const s of this.specimens) {
      const v = (s.repository ?? '').trim();
      if (v) set.add(v);
    }
    if (!set.size) return '—';
    const arr = Array.from(set);
    if (arr.length <= 2) return arr.join(' · ');
    return `${arr[0]} · ${arr[1]} · +${arr.length - 2}`;
  }

  /* ---------- Individual aggregates ---------- */
  private summarizeField(values: Array<string | undefined | null>): string {
    const cleaned = values.map(v => (v ?? '').toString().trim()).filter(Boolean);
    if (!cleaned.length) return '—';
    const set = new Set(cleaned.map(v => v.toLowerCase()));
    if (set.size === 1) return cleaned[0];
    return 'Multiple / ambiguous';
  }

  get sexSummary(): string {
    return this.summarizeField(this.individuals.map(i => i.sex));
  }

  get ageAtDeathSummary(): string {
    return this.summarizeField(this.individuals.map(i => i.ageAtDeath));
  }

  get ageClassSummary(): string {
    return this.summarizeField(this.individuals.map(i => i.ageClass));
  }

  /* ---------- Actions ---------- */
  exportAs(format: 'csv' | 'json'): void {
    if (!this.unit) return;
    this.showExportMenu = false;

    let blob: Blob;
    let fileName: string;

    if (format === 'json') {
      blob = new Blob([JSON.stringify(this.unit, null, 2)], { type: 'application/json' });
      fileName = `unit_${this.unit.osteologicalUnitId}.json`;
    } else {
      const headers = [
        'Unit ID', 'Unit Type', 'Site',
        'Specimen', 'BP Uncal', 'Range', 'Technique', 'Material', 'Repository',
        'Bone', 'Skeleton', 'Qty', 'Laterality'
      ];

      const rows: string[] = [];
      for (const s of this.specimens) {
        const bones = s.bones ?? [];
        if (!bones.length) {
          rows.push([
            this.unit.osteologicalUnitId,
            this.unit.unitType,
            this.unit.site?.siteName ?? '',
            s.specimenName ?? `Specimen ${s.specimenId}`,
            s.datesBpUncal ?? '',
            s.datesRange ?? '',
            s.datingTechnique ?? '',
            s.datingMaterial ?? '',
            s.repository ?? '',
            '', '', '', ''
          ].map(v => `"${String(v ?? '')}"`).join(','));
        } else {
          for (const b of bones) {
            rows.push([
              this.unit.osteologicalUnitId,
              this.unit.unitType,
              this.unit.site?.siteName ?? '',
              s.specimenName ?? `Specimen ${s.specimenId}`,
              s.datesBpUncal ?? '',
              s.datesRange ?? '',
              s.datingTechnique ?? '',
              s.datingMaterial ?? '',
              s.repository ?? '',
              b.boneName ?? '',
              b.skeletonType ?? '',
              b.boneQuantity ?? '',
              b.laterality ?? ''
            ].map(v => `"${String(v ?? '')}"`).join(','));
          }
        }
      }

      blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
      fileName = `unit_${this.unit.osteologicalUnitId}_bones.csv`;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName.replace(/\s+/g, '_');
    link.click();
  }

  shareUnit(): void {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `${this.primaryIndividualName} – Unit ${this.unit?.osteologicalUnitId ?? ''}`,
        text: `PaleoHumans – Unit ${this.unit?.osteologicalUnitId ?? ''}`,
        url
      }).catch(() => {});
      return;
    }

    navigator.clipboard.writeText(url).then(() => {
      alert('Link copied to clipboard');
    }).catch(() => {});
  }

  private handleError(message: string) {
    this.errorMessage = message;
    this.isLoading = false;
    console.error(message);
  }
}
