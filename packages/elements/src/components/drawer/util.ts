import { html, nothing, TemplateResult } from 'lit';
import { DrawerMode } from './drawer.component';

export const renderDrawer = ({ hasDetail, mode }: { hasDetail: boolean; mode: DrawerMode }, content: TemplateResult | typeof nothing) =>
  html`<mte-drawer class="z-10 w-full rounded-t-3xl bg-gray-200/60 shadow-xl backdrop-blur-lg" ?hasDetail=${hasDetail} .mode="${mode}">
    ${content}
  </mte-drawer>`;
