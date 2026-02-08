import 'zone.js';
import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { AngularWidgetComponent } from './app/angular-widget.component';

async function bootstrap() {
  const app = await createApplication();
  const AngularWidget = createCustomElement(AngularWidgetComponent, {
    injector: app.injector,
  });

  if (!customElements.get('angular-widget')) {
    customElements.define('angular-widget', AngularWidget);
  }

  const root = document.getElementById('root');
  if (root) {
    const el = document.createElement('angular-widget');
    root.appendChild(el);
  }
}

bootstrap();
