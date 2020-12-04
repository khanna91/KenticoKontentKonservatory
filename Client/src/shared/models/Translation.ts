import { ContentItem, Elements } from '@kentico/kontent-delivery';

export class Translation extends ContentItem {
  static codeName = "translation";
  content!: Elements.TextElement;
}
