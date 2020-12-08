import { ContentItem, Elements } from '@kentico/kontent-delivery';

export interface ITag {
  codeName: string;
  name: string;
  synonyms: string;
}

export class Tag extends ContentItem {
  static codeName = "tag";
  name!: Elements.TextElement;
  synonyms!: Elements.TextElement;
}
