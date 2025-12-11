import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card-info',
  templateUrl: './card.html',
  styleUrls: ['./card.css']
})
export class CardInfoComponent {
  @Input() icon = '';
  @Input() title = '';
  @Input() text = '';
}
