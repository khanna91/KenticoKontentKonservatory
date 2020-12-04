import { ContentItem, Elements } from '@kentico/kontent-delivery';

export class Tag extends ContentItem {
  static codeName = "tag";
  name!: Elements.TextElement;
}
