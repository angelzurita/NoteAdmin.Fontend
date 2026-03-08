import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { AiChatComponent } from '../features/ai/components/ai-chat/ai-chat.component';

@Component({
  selector: 'app-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, AiChatComponent],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class LayoutComponent {}
