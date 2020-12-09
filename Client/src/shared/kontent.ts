import { DeliveryClient, IContentItem, TypeResolver } from '@kentico/kontent-delivery';

import { Code } from './models/Code';
import { CustomElement } from './models/CustomElement';
import { Icon } from './models/Icon';
import { ISite, Site } from './models/Site';
import { Tag } from './models/Tag';
import { Translation } from './models/Translation';

import type { SvelteComponent } from "svelte/internal";
import type { Resource } from "i18next";
interface IKontent {
  projectId: string;
  previewApiKey: string;
  translations: Resource;
  site: ISite;
}

export interface ISession {
  kontent: IKontent;
}

export const deliveryClient = (options: Partial<IKontent>) => {
  const { projectId, previewApiKey } = options;

  return new DeliveryClient({
    projectId,
    previewApiKey,
    globalQueryConfig: {
      usePreviewMode: previewApiKey !== undefined,
    },
    typeResolvers: [
      new TypeResolver(Site.codename, () => new Site()),
      new TypeResolver(Code.codename, () => new Code()),
      new TypeResolver(CustomElement.codename, () => new CustomElement()),
      new TypeResolver(Icon.codename, () => new Icon()),
      new TypeResolver(Tag.codename, () => new Tag()),
      new TypeResolver(Translation.codename, () => new Translation()),
    ],
  });
};

export const extractComponents = <T>(
  components: Map<string, T>,
  mappings: Map<string, (item: IContentItem) => T>
) => (item: IContentItem) => {
  for (const entry of mappings) {
    const [codename, resolver] = entry;

    if (codename === item.system.type) {
      components.set(item.system.id, resolver(item));
    }
  }

  return `<object data-itemid="${item.system.id}" data-itemtype="${item.system.type}"/>`;
};

export type SvelteConstructor = (args: any) => SvelteComponent;

export const replaceComponents = <T>(
  node: HTMLElement,
  values: {
    components: Map<string, T>;
    replaceMap: Map<string, SvelteConstructor>;
  }
) => {
  const { components, replaceMap } = values;

  const placeholders = node.querySelectorAll("object");

  for (const placeholder of placeholders) {
    for (const entry of replaceMap) {
      const [codename, constructor] = entry;

      if (codename === placeholder.dataset.itemtype) {
        constructor({
          target: placeholder.parentNode,
          hydrate: true,
          props: components.get(placeholder.dataset.itemid),
        });
      }
    }
  }
};
