import 'zone.js';
import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { AngularWidgetComponent } from './app/angular-widget.component';

export async function mount(el: HTMLElement) {
  const app = await createApplication();
  const AngularWidget = createCustomElement(AngularWidgetComponent, {
    injector: app.injector,
  });

  if (!customElements.get('angular-widget')) {
    customElements.define('angular-widget', AngularWidget);
  }

  const widgetEl = document.createElement('angular-widget');
  el.appendChild(widgetEl);

  return () => {
    el.removeChild(widgetEl);
  };
}

export default mount;
