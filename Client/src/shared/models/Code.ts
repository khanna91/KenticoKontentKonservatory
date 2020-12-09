import { ContentItem, Elements } from '@kentico/kontent-delivery';

export interface ICode {
  code: string;
}

export class Code extends ContentItem {
  static codename = "code";
  code!: Elements.TextElement;
}
