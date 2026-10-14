import { Component, ChangeDetectionStrategy, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';

@Component({
  selector: 'app-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
  host: { '(document:keydown.escape)': 'closeMenu()' },
})
export class LayoutComponent {
  /** Side menu open as a drawer (phones); on desktop it is always visible */
  readonly menuOpen = signal(false);

  constructor() {
    // Going to another page closes the drawer
    inject(Router)
      .events.pipe(filter((e) => e instanceof NavigationEnd), takeUntilDestroyed(inject(DestroyRef)))
      .subscribe(() => this.menuOpen.set(false));
  }

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }
}
