import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card-info',
  templateUrl: './card-info.html',
  styleUrls: ['./card-info.css']
})
export class CardInfoComponent {
  @Input() icon = '';
  @Input() title = '';
  @Input() text = '';
}
