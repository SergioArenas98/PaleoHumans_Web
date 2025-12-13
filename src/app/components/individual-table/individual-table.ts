import { Component, Input } from '@angular/core';
import { Individual } from '../../models/Individual';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-individual-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './individual-table.html',
  styleUrls: ['./individual-table.css']
})
export class IndividualTable {
  @Input() individuals: Individual[] = [];
}