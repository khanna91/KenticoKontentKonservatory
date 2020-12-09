import { ContentItem, Elements } from '@kentico/kontent-delivery';

export interface ITag {
  codename: string;
  name: string;
  synonyms: string;
}

export class Tag extends ContentItem {
  static codename = "tag";
  name!: Elements.TextElement;
  synonyms!: Elements.TextElement;
}
