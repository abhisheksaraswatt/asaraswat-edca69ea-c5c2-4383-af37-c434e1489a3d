import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding:24px">
      <h2>✅ Logged in</h2>
      <p>You are now authenticated. Token saved in localStorage.</p>
    </div>
  `,
})
export class HomeComponent {}
