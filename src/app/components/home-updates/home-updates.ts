import { Component } from '@angular/core';

type UpdateItem = {
  title: string;
  detail: string;
  icon: string;
};

@Component({
  selector: 'app-home-updates',
  standalone: true,
  templateUrl: './home-updates.html',
  styleUrls: ['./home-updates.css']
})
export class HomeUpdatesComponent {
  items: UpdateItem[] = [
    {
      title: 'Transparent exports',
      detail: 'Export standardized datasets and keep your analysis pipeline reproducible.',
      icon: 'download'
    },
    {
      title: 'Quality-first curation',
      detail: 'Records are maintained with bibliographic cross-references and verified coordinates.',
      icon: 'verified'
    },
    {
      title: 'Built for browsing',
      detail: 'Fast search, clean filters, and a consistent UI across modules.',
      icon: 'search'
    }
  ];
}
