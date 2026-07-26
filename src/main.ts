import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import mermaid from 'mermaid';

// Expose mermaid globally for use in components
(window as any).mermaid = mermaid;

mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'loose',
  theme: 'base',
  themeVariables: {
    primaryColor: '#e8f3ef',
    primaryTextColor: '#136148',
    primaryBorderColor: '#136148',
    lineColor: '#136148',
    secondBkgColor: '#f0f4f8',
    tertiaryColor: '#fbba17',
  },
});

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
