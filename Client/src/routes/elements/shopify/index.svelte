<script lang="ts">
  import CustomElement from "./../_shared/customElement/customElement.svelte";
  import { translate } from "../../../utilities/translateStore";
  import Loading from "../../../shared/loading.svelte";
  import translations from "./_resources";
  import sharedTranslations from "./../_shared/resources";
  import ObjectTile from "./../_shared/objectTile.svelte";
  import type { IPriceV2, IProduct, IQueryRoot } from "./_shopify";
  import { GraphQLClient, gql } from "graphql-request";
  import DOMPurify from "dompurify";
  import { fade } from "svelte/transition";
  import Invalid from "../_shared/customElement/invalid.svelte";

  interface IShopifyConfig {
    storefrontAccessToken: string;
    graphqlEndpoint: string;
  }

  interface IShopifyValue {
    product?: IProduct;
  }

  let value: IShopifyValue = {};
  let config: IShopifyConfig;
  let disabled: boolean;

  let listOpen: boolean = false;
  let filter: string;

  $: graphQLClient =
    config &&
    new GraphQLClient(config.graphqlEndpoint, {
      headers: {
        "X-Shopify-Storefront-Access-Token": config.storefrontAccessToken,
        accept: "application/json",
      },
    });

  $: data = graphQLClient?.request<IQueryRoot>(gql`
    {
      products(first: 250) {
        edges {
          node {
            id
            images(first: 1, maxHeight: 250) {
              edges {
                node {
                  originalSrc
                  transformedSrc
                }
              }
            }
            title
            descriptionHtml
            variants(first: 1) {
              edges {
                node {
                  id
                  priceV2 {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  `);

  const formatProductPrice = (price: IPriceV2) => {
    const { amount, currencyCode } = price;

    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
    }).format(parseFloat(amount));
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
              filter = '';
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
          {#await data}
            <Loading />
          {:then dataResult}
            <div class="group" transition:fade>
              <label class="group column filter"><div class="label">
                  {$t('search')}
                </div>
                <input
                  class="input"
                  type="text"
                  placeholder={$t('placeholder')}
                  bind:value={filter} />
              </label>
            </div>
            <div class="group wrap">
              {#each dataResult.products.edges
                .map((edge) => edge.node)
                .filter((product) => {
                  if (!filter) {
                    return true;
                  }

                  const lowerFilter = filter.toLowerCase();

                  if (product.title.toLowerCase().includes(lowerFilter)) {
                    return true;
                  }

                  if (product.descriptionHtml
                      .toLowerCase()
                      .includes(lowerFilter)) {
                    return true;
                  }

                  return false;
                }) as product, index (product.id)}
                <ObjectTile
                  name={product.title}
                  detail={formatProductPrice(product.variants.edges[0].node.priceV2)}
                  imageUrl={product.images.edges[0].node.originalSrc}
                  thumbnailUrl={product.images.edges[0].node.originalSrc}
                  delay={index * 50}
                  onClick={() => {
                    value.product = product;
                    filter = '';
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
            <div>
              <img
                class="image"
                src={value.product.images.edges[0].node.originalSrc}
                alt={value.product.title} />
            </div>
            <div class="description">
              <h2>{value.product.title}</h2>
              <h3>
                {formatProductPrice(value.product.variants.edges[0].node.priceV2)}
              </h3>
              {@html DOMPurify.sanitize(value.product.descriptionHtml, {
                WHOLE_DOCUMENT: false,
                FORBID_TAGS: ['object'],
              })}
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
