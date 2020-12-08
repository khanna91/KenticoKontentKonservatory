import { ContentItem, Elements } from '@kentico/kontent-delivery';

import type { ITag, Tag } from "./Tag";

export interface ICustomElement {
  codeName: string;
  name: string;
  description: string;
  image: {
    src: string;
    alt: string;
  };
  tags: ITag[];
  route: string;
  github: string;
}

export class CustomElement extends ContentItem {
  static codeName = "custom_element";
  name!: Elements.TextElement;
  description!: Elements.RichTextElement;
  image!: Elements.AssetsElement;
  tags!: Elements.LinkedItemsElement<Tag>;
  route!: Elements.UrlSlugElement;
  github!: Elements.TextElement;
}
