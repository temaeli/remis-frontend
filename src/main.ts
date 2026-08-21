import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import mermaid from 'mermaid';

// Expose mermaid globally for use in components
(window as any).mermaid = mermaid;

// Only what has to be global. No palette here on purpose: colours come from the
// application's own `--mat-sys-*` theme tokens, read at render time by whichever
// component is drawing — see workflow-diagram.component.ts. Setting them here
// too would be a second source of truth, and the last one drifted into carrying
// another application's brand.
//
// securityLevel is deliberately global: mermaid ignores it in a per-diagram init
// directive, and 'loose' is what lets a node label carry <br/> for a line break.
mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'loose',
  theme: 'base',
});

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
