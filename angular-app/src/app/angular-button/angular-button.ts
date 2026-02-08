import { Component } from '@angular/core';

@Component({
  selector: 'app-angular-button',
  standalone: true,
  imports: [],
  templateUrl: './angular-button.html',
  styleUrl: './angular-button.css',
})
export class AngularButton {
  count = 0;

  increment() {
    this.count++;
  }
}
