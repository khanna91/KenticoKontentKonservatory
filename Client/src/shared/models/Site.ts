import { ContentItem, Elements } from '@kentico/kontent-delivery';

import type { CustomElement } from "./CustomElement";

export class Site extends ContentItem {
  static codeName = "site";
  name!: Elements.TextElement;
  custom_elements!: Elements.LinkedItemsElement<CustomElement>;
}
