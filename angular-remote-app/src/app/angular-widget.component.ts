import { Component } from '@angular/core';

@Component({
  selector: 'app-angular-widget',
  standalone: true,
  template: `
    <div class="angular-widget">
      <h2>🅰️ Angular Remote Widget</h2>
      <p>This component is served from the <strong>Angular Remote App</strong> (port 5002).</p>
      <p>It is loaded into the host shell via Module Federation.</p>
      <p>Current time: {{ currentTime }}</p>
      <button (click)="updateTime()">Update Time</button>
    </div>
  `,
  styles: [`
    .angular-widget {
      padding: 20px;
      margin: 10px;
      border: 2px solid #dd0031;
      border-radius: 8px;
      background-color: #1a1a2e;
      color: #dd0031;
      font-family: Arial, sans-serif;
    }
    button {
      padding: 8px 16px;
      background-color: #dd0031;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    button:hover {
      background-color: #c3002f;
    }
  `],
})
export class AngularWidgetComponent {
  currentTime = new Date().toLocaleTimeString();

  updateTime() {
    this.currentTime = new Date().toLocaleTimeString();
  }
}
