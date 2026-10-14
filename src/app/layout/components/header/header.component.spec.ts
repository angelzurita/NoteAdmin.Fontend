import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { HeaderComponent } from './header.component';
import { ConfigService } from '../../../core/services';

describe('HeaderComponent', () => {
  function render(portal: string | null) {
    TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    const config = TestBed.inject(ConfigService);
    (config as unknown as { current: { set: (v: unknown) => void } }).current.set({ sso: true, portal });
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows the back-to-Disciplina button pointing to the portal', () => {
    const el = render('https://disciplina.zuritaserver.com/#labs');
    const link = el.querySelector<HTMLAnchorElement>('[data-testid="volver-disciplina"]');
    expect(link?.getAttribute('href')).toBe('https://disciplina.zuritaserver.com/#labs');
    expect(link?.textContent).toContain('Disciplina');
  });

  it('hides the button when the server has no portal', () => {
    expect(render(null).querySelector('[data-testid="volver-disciplina"]')).toBeNull();
  });

  it('has a menu button for phones', () => {
    expect(render(null).querySelector('[data-testid="menu-movil"]')).not.toBeNull();
  });
});
