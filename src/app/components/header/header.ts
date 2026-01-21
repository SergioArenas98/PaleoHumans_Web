import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

type NavItem = {
  path: string;
  label: string;
  icon?: string;
  exact?: boolean;
};

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class HeaderComponent {
  isMobileMenuOpen = false;

  navItems: NavItem[] = [
    { path: '/', label: 'Home', exact: true },
    { path: '/sites', label: 'Sites', icon: 'location_on' },
    { path: '/map', label: 'Map', icon: 'map' },
  ];

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }
}
