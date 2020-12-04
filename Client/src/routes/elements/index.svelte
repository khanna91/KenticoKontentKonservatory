<script context="module" lang="ts">
  import type { Preload } from "../_sapper";
  import { fly } from "svelte/transition";
  import type { ISession, SvelteConstructor } from "../../shared/kontent";
  import {
    deliveryClient,
    extractComponents,
    replaceComponents,
  } from "../../shared/kontent";
  import { Site } from "../../shared/models/Site";
  import type { ICode } from "../../shared/models/Code";
  import { Code as CodeModel } from "../../shared/models/Code";
  import type { ICustomElement } from "../../shared/models/CustomElement";
  import type { Resource } from "i18next";

  interface IIcon {
    name: string;
    codeName: string;
    label: string;
    style: string;
    unicode: string;
    svg: string;
    cssClass: string;
  }

  export const preload: Preload<
    {
      translations: Resource;
      name: string;
      customElements: ICustomElement[];
      components: Map<string, ICode>;
      icons: IIcon[];
    },
    ISession
  > = async function (this, page, session) {
    const components = new Map<string, ICode>();
    const richTextResolver = extractComponents(
      components,
      new Map([
        [
          CodeModel.codeName,
          (item) => ({
            code: (item as CodeModel).code.value,
          }),
        ],
      ])
    );

    const site = (
      await deliveryClient(session.kontent)
        .items<Site>()
        .type(Site.codeName)
        .depthParameter(6)
        .queryConfig({
          richTextResolver,
        })
        .toPromise()
    ).items[0];

    const icons = (
      await deliveryClient(session.kontent)
        .items<Icon>()
        .type(Icon.codeName)
        .toPromise()
    ).items;

    return {
      translations: session.kontent.translations,
      name: site.name.value,
      customElements: site.custom_elements.value.map((element) => ({
        name: element.name.value,
        codeName: element.system.codename,
        description: element.description.resolveHtml(),
        image: {
          src: element.image.value[0].url,
          alt: element.image.value[0].description,
        },
        tags: element.tags.value.map((tag) => ({
          name: tag.name.value,
          codeName: tag.system.codename,
        })),
        route: element.route.value,
        github: element.github.value,
      })),
      components,
      icons: icons.map((icon) => ({
        ...JSON.parse(icon.icon.value).icon,
        codeName: icon.system.codename,
      })),
    };
  };
</script>

<script lang="ts">
  import sortArray from "sort-array";
  import { onMount, tick } from "svelte";
  import Code from "../../shared/components/code.svelte";
  import { translate } from "../../utilities/translateStore";
  import { Icon } from "../../shared/models/Icon";

  export let translations: Resource;
  export let name: string;
  export let customElements: ICustomElement[];
  export let components: Map<string, ICode>;
  export let icons: IIcon[];

  let selectedElement: ICustomElement;

  const replaceMap = new Map<string, SvelteConstructor>([
    [CodeModel.codeName, (args) => new Code(args)],
  ]);

  onMount(() => {
    if (window.location.hash) {
      selectedElement = customElements.find(
        (customElement) =>
          customElement.codeName == window.location.hash.slice(1)
      );
    }
  });

  $: selectedElement && scrollToElement();

  const scrollToElement = async () => {
    if (selectedElement) {
      const listItem = document.getElementById(selectedElement.codeName);

      if (listItem) {
        await tick();

        window.scrollTo({
          top: listItem.offsetTop,
          behavior: "smooth",
        });
      }
    }
  };

  const sampleIcon = icons.find((icon) => icon.codeName == "code");
  const gitHubIcon = icons.find((icon) => icon.codeName == "github_icon");

  const t = translate(translations);
</script>

<svelte:head>
  <title>{name}</title>
</svelte:head>

<h1>{name}</h1>
<section>
  <div class="list">
    {#each sortArray(customElements, {
      by: ['name'],
    }) as customElement (customElement.name)}
      <div
        class="item"
        id={customElement.codeName}
        class:selected={selectedElement == customElement}
        on:click={() => {
          if (selectedElement !== customElement) {
            selectedElement = customElement;
            history.replaceState(undefined, undefined, `${window.location.origin}${window.location.pathname}#${customElement.codeName}`);
          }
        }}>
        <div class="content">
          <h2 class="name">{customElement.name}</h2>
          {#if selectedElement == customElement}
            {#each sortArray(customElement.tags, {
              by: ['name'],
            }) as tag (tag.codeName)}
              <span class="tag">{tag.name}</span>
            {/each}
            <div
              class="description"
              use:replaceComponents={{ components, replaceMap }}>
              {@html customElement.description}
            </div>
            <a
              class="badge"
              href={customElement.route}>{@html sampleIcon.svg}{$t('sample')}</a>
            <a
              class="badge"
              href={customElement.github}>{@html gitHubIcon.svg}{$t('github')}</a>
          {/if}
        </div>
        {#key selectedElement}
          {#if selectedElement == customElement}
            <img
              class="image"
              in:fly={{ y: 100, delay: 100 }}
              src={selectedElement.image.src}
              alt={selectedElement.image.alt} />
          {/if}
        {/key}
      </div>
    {/each}
  </div>
  <div class="imagePad" />
</section>

<style>
  h1 {
    text-align: center;
    font-size: 5em;
    text-transform: uppercase;
    font-weight: 700;
    margin: 0 0 0.5em 0;
  }

  .list {
    flex: 1;
    z-index: 1;
  }

  .item {
    padding: 1em;
    border-radius: 0.5em;
    border: transparent solid 0.3em;
    z-index: -1;
    display: flex;
    position: relative;
  }

  .item.selected {
    box-shadow: #afafaf 0em 0.2em 0.4em;
  }

  .item:not(.selected) {
    cursor: pointer;
  }

  .item:not(.selected):hover {
    box-shadow: #afafaf 0em 0em 0.4em;
    background: white;
  }

  .item.selected .description {
    display: block;
  }

  .item:not(.selected) .description {
    display: none;
  }

  .content {
    flex: 1;
  }

  .name {
    margin: 0;
  }

  .item.selected .name {
    margin-bottom: 0.5em;
  }

  .tag {
    font-size: 0.8em;
    background: #d0d0d0;
    margin-right: 0.2em;
    text-transform: uppercase;
    border-radius: 50vh;
    padding: 0.2em 0.6em;
    color: white;
    font-weight: 600;
  }

  .badge {
    background: #81d272;
    margin-right: 0.2em;
    border-radius: 50vh;
    padding: 0.2em 0.6em;
    color: #ffffff;
    fill: #ffffff;
    font-weight: 700;
    text-decoration: none;
  }

  .badge:hover {
    background: #5d9b52;
  }

  :global(.badge svg) {
    height: 0.9em;
    padding: 0 0.4em 0 0;
  }

  .imagePad {
    flex: 2;
    margin: 0 0 0 1em;
  }

  .image {
    position: absolute;
    left: calc(100% + 2em);
    max-height: 100%;
  }

  @media (max-width: 800px) {
    h1 {
      font-size: 3em;
    }

    .item {
      flex-direction: column;
    }

    .imagePad {
      display: none;
    }

    .image {
      position: relative;
      left: initial;
      max-width: 100%;
    }
  }
</style>
