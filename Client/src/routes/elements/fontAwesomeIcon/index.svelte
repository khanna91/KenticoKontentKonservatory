<script lang="ts">
  import CustomElement from "./../_shared/customElement/customElement.svelte";
  import { translate } from "../../../utilities/translateStore";
  import Loading from "../../../shared/loading.svelte";
  import translations from "./_resources";
  import sharedTranslations from "../_shared/resources";
  import ObjectTile from "../_shared/objectTile.svelte";
  import type { IFontAwesomeIcons } from "./_fontAwesomeIcons";
  import { fade } from "svelte/transition";
  import Invalid from "../_shared/customElement/invalid.svelte";
  import wretch from "wretch";
  import { debounce, flatMap } from "lodash";

  interface ISearchIcon {
    name: string;
    label: string;
    style: string;
    search: string;
    unicode: string;
    svg: string;
  }

  interface IIcon {
    name: string;
    label: string;
    style: string;
    unicode: string;
    svg: string;
    cssClass: string;
  }

  interface IFontAwesomeIconConfig {
    iconsMetadataEndpoint: string;
  }

  interface IFontAwesomeIconValue {
    icon?: IIcon;
  }

  let value: IFontAwesomeIconValue = {};
  let config: IFontAwesomeIconConfig;
  let disabled: boolean;

  let listOpen: boolean = false;
  let rawFilter: string = "";

  $: if (rawFilter !== "") {
    debounceFilter(rawFilter);
  }

  const debounceFilter = debounce((rawFilter) => (filter = rawFilter), 500);

  let filter: string = "";

  let data: ISearchIcon[];

  $: config && loadData();

  const loadData = async () => {
    const rawData = await wretch(config.iconsMetadataEndpoint)
      .get()
      .json<IFontAwesomeIcons>();

    data = flatMap(Object.entries(rawData), (entry) => {
      const [name, icon] = entry;

      return icon.styles.map((style) => ({
        name,
        label: icon.label,
        style,
        search: `${name} ${
          icon.search.terms.length > 0
            ? `(${icon.search.terms.join(", ")})`
            : ""
        }`,
        unicode: icon.unicode,
        svg: icon.svg[style].raw,
      }));
    });
  };

  $: filteredData = data && filterData(filter);

  const filterData = (filter: string) => {
    const results: ISearchIcon[] = [];

    if (filter === "") {
      return data.slice(0, 100);
    }

    const lowerFilter = filter.toLowerCase();

    for (const icon of data) {
      if (results.length === 100) {
        break;
      }

      if (icon.search.toLowerCase().includes(lowerFilter)) {
        results.push(icon);
        continue;
      }
    }

    return results;
  };

  const t = translate(translations, [sharedTranslations]);
</script>

<CustomElement bind:value bind:config bind:disabled>
  <div transition:fade>
    {#if !disabled}
      <div class="group">
        {#if !listOpen}
          <button class="button" on:click={() => (listOpen = true)}>
            {$t('open')}
          </button>
        {:else}
          <button
            class="button"
            on:click={() => {
              rawFilter = '';
              filter = '';
              listOpen = false;
            }}>
            {$t('close')}
          </button>
        {/if}
        {#if value.icon}
          <button
            class="button destructive"
            in:fade|local
            on:click={() => {
              value.icon = undefined;
            }}>
            {$t('clear')}
          </button>
        {/if}
      </div>
      <div class="group column">
        {#if listOpen}
          <div class="group" transition:fade>
            <label class="group column filter"><div class="label">
                {$t('search')}
              </div>
              <input
                class="input"
                type="text"
                placeholder={$t('placeholder')}
                bind:value={rawFilter} />
            </label>
          </div>
          <div class="group wrap">
            {#each filteredData as icon (icon.name + icon.style)}
              <ObjectTile
                title={icon.search}
                size={6}
                onClick={() => {
                  value.icon = { name: icon.name, label: icon.label, unicode: icon.unicode, style: icon.style, svg: icon.svg, cssClass: `fa${icon.style[0]} fa-${icon.name}` };
                  rawFilter = '';
                  filter = '';
                  listOpen = false;
                }}>
                <div slot="image" class="tile">
                  {@html icon.svg}
                </div>
              </ObjectTile>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
    {#if value.icon}
      <div class="group column" transition:fade>
        <div>{$t('previewDescription')}</div>
        <div class="preview">
          <div class="description">
            <h2>{value.icon.label}</h2>
          </div>
          <div class="image">
            {@html value.icon.svg}
          </div>
        </div>
      </div>
    {/if}
  </div>
  <div slot="loading">
    <Loading />
  </div>
  <div slot="invalid">
    <Invalid />
  </div>
</CustomElement>

<style>
  .filter {
    flex: 1;
  }

  .preview {
    text-align: center;
  }

  .image {
    max-width: 10em;
    margin: 0 auto;
  }

  .tile {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .tile > :global(svg) {
    margin: 0.5em;
  }
</style>
