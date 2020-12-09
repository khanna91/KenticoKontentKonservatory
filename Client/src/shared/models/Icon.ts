import { ContentItem, Elements } from '@kentico/kontent-delivery';

export class Icon extends ContentItem {
  static codename = "icon";
  icon!: Elements.CustomElement;
}
