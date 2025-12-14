import { Component, Input } from '@angular/core';
import { Individual } from '../../models/Individual';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-individual-table',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './individual-table.html',
  styleUrls: ['./individual-table.css']
})
export class IndividualTable {
  @Input() individuals: Individual[] = [];
}