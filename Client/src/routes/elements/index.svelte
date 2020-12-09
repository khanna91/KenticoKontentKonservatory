<script context="module" lang="ts">
  import type { Preload } from "../_sapper";
  import { fly } from "svelte/transition";
  import type { ISession, SvelteConstructor } from "../../shared/kontent";
  import {
    deliveryClient,
    extractComponents,
    replaceComponents,
  } from "../../shared/kontent";
  import type { ICode } from "../../shared/models/Code";
  import { Code as CodeModel } from "../../shared/models/Code";
  import type { ICustomElement } from "../../shared/models/CustomElement";
  import { CustomElement } from "../../shared/models/CustomElement";
  import type { Resource } from "i18next";

  interface IIcon {
    name: string;
    codename: string;
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
          CodeModel.codename,
          (item) => ({
            code: (item as CodeModel).code.value,
          }),
        ],
      ])
    );

    const customElements = (
      await deliveryClient(session.kontent)
        .items<CustomElement>()
        .type(CustomElement.codename)
        .queryConfig({
          richTextResolver,
        })
        .toPromise()
    ).items;

    const icons = (
      await deliveryClient(session.kontent)
        .items<Icon>()
        .type(Icon.codename)
        .toPromise()
    ).items;

    return {
      translations: session.kontent.translations,
      name: session.kontent.site.name,
      customElements: customElements.map((element) => ({
        name: element.name.value,
        codename: element.system.codename,
        description: element.description.resolveHtml(),
        image: {
          src: element.image.value[0].url,
          alt: element.image.value[0].description,
        },
        tags: element.tags.value.map((tag) => ({
          name: tag.name.value,
          codename: tag.system.codename,
          synonyms: tag.synonyms.value,
        })),
        route: element.route.value,
        github: element.github.value,
      })),
      components,
      icons: icons.map((icon) => ({
        ...JSON.parse(icon.icon.value).icon,
        codename: icon.system.codename,
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
    [CodeModel.codename, (args) => new Code(args)],
  ]);

  onMount(() => {
    if (window.location.hash) {
      selectedElement = customElements.find(
        (customElement) =>
          customElement.codename == window.location.hash.slice(1)
      );
    }
  });

  $: selectedElement && scrollToElement();

  const scrollToElement = async () => {
    if (selectedElement) {
      const listItem = document.getElementById(selectedElement.codename);

      if (listItem) {
        await tick();

        window.scrollTo({
          top: listItem.offsetTop,
          behavior: "smooth",
        });
      }
    }
  };

  let filter: string = "";

  $: if (filter) {
    selectedElement = undefined;
    history.replaceState(
      undefined,
      undefined,
      `${window.location.origin}${window.location.pathname}`
    );
  }

  $: sortedElements = sortArray(
    customElements.filter((customElement) => {
      if (filter === "") {
        return true;
      }

      const matches = (value: string) => value.match(new RegExp(filter, "gi"));

      if (matches(customElement.name)) {
        return true;
      }

      if (
        customElement.tags.some(
          (tag) => matches(tag.name) || matches(tag.synonyms)
        )
      ) {
        return true;
      }

      if (matches(customElement.description)) {
        return true;
      }

      return false;
    }),
    {
      by: ["name"],
    }
  );

  const sampleIcon = icons.find((icon) => icon.codename == "code");
  const gitHubIcon = icons.find((icon) => icon.codename == "github_icon");

  const t = translate(translations);
</script>

<svelte:head>
  <title>{name}</title>
</svelte:head>

<h1>{name}</h1>
<section>
  <div class="list">
    <div class="filter">
      <input
        type="text"
        placeholder={$t('filter_custom_elements')}
        bind:value={filter} />
    </div>
    {#each sortedElements as customElement (customElement.name)}
      <div
        class="group"
        id={customElement.codename}
        class:selected={selectedElement == customElement}
        on:click={() => {
          if (selectedElement !== customElement) {
            selectedElement = customElement;
            history.replaceState(undefined, undefined, `${window.location.origin}${window.location.pathname}#${customElement.codename}`);
          }
        }}>
        <div class="content">
          <h2 class="name">{customElement.name}</h2>
          {#if selectedElement == customElement}
            {#each sortArray(customElement.tags, {
              by: ['name'],
            }) as tag (tag.codename)}
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
        <div class="image">
          {#key selectedElement}
            {#if selectedElement == customElement}
              <img
                in:fly={{ y: 100, delay: 100 }}
                src={selectedElement.image.src}
                alt={selectedElement.image.alt} />
            {/if}
          {/key}
        </div>
      </div>
    {/each}
  </div>
</section>

<style>
  h1 {
    text-align: center;
    font-size: 5em;
    text-transform: uppercase;
    font-weight: 700;
    margin: 0 0 0.5em 0;
  }

  .filter {
    display: flex;
  }

  .filter input {
    flex: 1;
    margin: 0.2em 0.2em 0.5em;
    padding: 0.3em;
    font-size: 1.2em;
    border: none;
    border-bottom: #cacaca solid;
  }

  .filter input:focus {
    outline: none;
    border-bottom: #727272 solid;
  }

  .list {
    flex: 1;
    z-index: 1;
  }

  .group.selected .content {
    box-shadow: #afafaf 0em 0.2em 0.4em;
  }

  .group:not(.selected):hover .content {
    box-shadow: #afafaf 0em 0em 0.4em;
    background: white;
    cursor: pointer;
  }

  .group.selected .content .description {
    display: block;
  }

  .group:not(.selected) .content .description {
    display: none;
  }

  .content {
    flex: 2;
    padding: 1em;
    border-radius: 0.5em;
    border: transparent solid 0.3em;
    position: relative;
  }

  .name {
    margin: 0;
  }

  .group.selected .name {
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

  :global(sup) {
    display: inline-block;
    border-style: solid;
    color: #4c4d52;
    border-color: #919194;
    padding: 0.1em 0.2em;
    font-size: 0.85em;
    border-width: 0.1em;
    border-radius: 0.25em;
    vertical-align: initial;
    line-height: 1.1em;
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

  .image {
    padding-left: 1em;
    flex: 3;
  }

  .image img {
    max-width: 100%;
  }

  @media (max-width: 800px) {
    h1 {
      font-size: 3em;
    }

    .group {
      flex-direction: column;
    }

    .image {
      padding: 1em 0 0;
    }

    .image {
      position: relative;
      left: initial;
      max-width: 100%;
    }
  }
</style>
