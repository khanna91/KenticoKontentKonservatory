import { ContentItem, Elements } from '@kentico/kontent-delivery';

export class Icon extends ContentItem {
  static codeName = "icon";
  icon!: Elements.CustomElement;
}
