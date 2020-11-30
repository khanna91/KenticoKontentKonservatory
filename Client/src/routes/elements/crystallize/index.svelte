<script lang="ts">
  import CustomElement, {
    translate,
  } from "../_shared/customElement/customElement.svelte";
  import Loading from "../../../shared/loading.svelte";
  import translations from "./_resources";
  import sharedTranslations from "../_shared/resources";
  import ObjectTile from "../_shared/objectTile.svelte";
  import type { IPriceVariant, IProduct, IQueryRoot } from "./_crystallize";
  import { GraphQLClient, gql } from "graphql-request";
  import { fade } from "svelte/transition";
  import Invalid from "../_shared/customElement/invalid.svelte";
  import { debounce } from "lodash";
  import type { IContext } from "../_shared/customElement/customElement";

  interface ICrystallizeConfig {
    graphqlEndpoint: string;
    defaultCurrency: string;
    currencyMap: Map<string, string>;
  }

  interface ICrystallizeValue {
    product?: IProduct;
  }

  let value: ICrystallizeValue = {};
  let config: ICrystallizeConfig;
  let context: IContext;
  let disabled: boolean;

  let listOpen: boolean = false;

  $: graphQLClient = config && new GraphQLClient(config.graphqlEndpoint);

  let rawFilter: string = "";

  $: if (rawFilter !== "") {
    debounceFilter(rawFilter);
  }

  const debounceFilter = debounce((rawFilter) => (filter = rawFilter), 1000);

  let filter: string;

  $: data =
    filter &&
    graphQLClient?.request<IQueryRoot>(gql`
    query CatalogueSearch {
      search(
        filter: {
          searchTerm: "${filter}"
          type: PRODUCT
          productVariants: { isDefault: true }
        }
        orderBy: { field: PRICE, direction: ASC }
      ) {
        edges {
          node {
            id
            name
            ... on Product {
              variants {
                sku
                priceVariants {
                  price
                  currency
                }
                images {
                  url
                }
              }
            }
          }
        }
      }
    }
  `);

  const formatProductPrice = (priceVariants: IPriceVariant[]) => {
    var currencyMap = new Map(config.currencyMap);

    const { price, currency } =
      priceVariants.find(
        (priceVariant) =>
          currencyMap.get(context.variant.codename) === priceVariant.currency
      ) ||
      priceVariants.find(
        (priceVariant) => config.defaultCurrency === priceVariant.currency
      );

    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency,
    }).format(price);
  };

  const t = translate(translations, [sharedTranslations]);
</script>

<CustomElement bind:value bind:config bind:context bind:disabled>
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
              data = undefined;
              listOpen = false;
            }}>
            {$t('close')}
          </button>
        {/if}
        {#if value.product}
          <button
            class="button destructive"
            in:fade|local
            on:click={() => (value.product = undefined)}>
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
        {/if}
        {#if data && listOpen}
          {#await data}
            <Loading />
          {:then dataResult}
            <div class="group wrap">
              {#each dataResult.search.edges.map((edge) => edge.node) as product, index (product.id)}
                <ObjectTile
                  name={product.name}
                  detail={formatProductPrice(product.variants[0].priceVariants)}
                  imageUrl={product.variants[0].images[0].url}
                  thumbnailUrl={product.variants[0].images[0].url}
                  delay={index * 50}
                  onClick={() => {
                    value.product = product;
                    rawFilter = '';
                    data = undefined;
                    listOpen = false;
                  }} />
              {/each}
            </div>
          {/await}
        {/if}
      </div>
    {/if}
    {#if value.product}
      <div class="group" transition:fade>
        <div class="group column">
          <div>{$t('previewDescription')}</div>
          <div class="group">
            <div class="item">
              <img
                class="image"
                src={value.product.variants[0].images[0].url}
                alt={value.product.name} />
            </div>
            <div class="description">
              <h2>{value.product.name}</h2>
              <h3>
                {formatProductPrice(value.product.variants[0].priceVariants)}
              </h3>
            </div>
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
  .image {
    max-width: 100%;
  }

  .description {
    flex: 2;
    margin: 0 1em;
  }

  .filter {
    flex: 1;
  }
</style>
