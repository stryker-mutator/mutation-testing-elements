import { html, nothing, TemplateResult } from 'lit';
import { DrawerMode } from './drawer.component';

export const renderDrawer = ({ hasDetail, mode }: { hasDetail: boolean; mode: DrawerMode }, content: TemplateResult | typeof nothing) =>
  html`<mte-drawer
    class="container fixed bottom-0 z-10 mx-auto overflow-hidden rounded-t-3xl bg-gray-200/60 shadow-xl backdrop-blur-lg motion-safe:transition-[height,max-width] motion-safe:duration-200"
    ?hasDetail=${hasDetail}
    .mode="${mode}"
  >
    ${content}
  </mte-drawer>`;
