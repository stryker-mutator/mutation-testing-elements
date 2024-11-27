import { LitElement } from 'lit';

import { tailwind } from '../style/index.js';

export abstract class BaseElement extends LitElement {
  public static styles = [tailwind];
}
