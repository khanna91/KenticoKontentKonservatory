<script lang="ts">
  import CustomElement, {
    translate,
  } from "./../_shared/customElement/customElement.svelte";
  import Loading from "../../../shared/loading.svelte";
  import translations from "./_resources";
  import sharedTranslations from "./../_shared/resources";
  import { fade } from "svelte/transition";
  import Invalid from "../_shared/customElement/invalid.svelte";
  import type { IHubSpotForm } from "./_hubSpot";
  import { onMount } from "svelte";
  import wretch from "wretch";
  import { localStore } from "../../../utilities/localStore";

  enum LocalStorageKeys {
    Code = "HubSpotForms:code",
    RefreshToken = "HubSpotForms:refreshToken",
  }

  interface IHubSpotFormsResponse {
    forms: IHubSpotForm[];
    refreshToken: string;
  }

  interface IHubSpotFormsConfig {
    formsEndpoint: string;
    clientId: string;
  }

  interface IHubSpotFormsValue {
    form?: IHubSpotForm;
  }

  let value: IHubSpotFormsValue = {};
  let config: IHubSpotFormsConfig;
  let disabled: boolean;

  let loading: boolean = true;
  let redirectUri: string;
  let forms: IHubSpotForm[];
  let showForm: boolean = true;

  const codeStore = localStore<string>(LocalStorageKeys.Code);
  const refreshTokenStore = localStore<string>(LocalStorageKeys.RefreshToken);

  onMount(() => {
    redirectUri = window.location.href;

    const codeParameter = new URLSearchParams(window.location.search).get(
      "code"
    );

    if (codeParameter) {
      codeStore.set(codeParameter);
      window.close();
    }
  });

  $: if (!$codeStore && config) {
    window.open(
      `https://app.hubspot.com/oauth/authorize?scope=contacts%20forms&client_id=${config.clientId}&redirect_uri=${redirectUri}`,
      undefined,
      "width=800,height=600"
    );
  }

  $: $codeStore && config && loadForms();

  const loadForms = async () => {
    let continueRequest = true;

    const request = wretch(`${config.formsEndpoint}`)
      .post({
        clientId: config.clientId,
        redirectUri: redirectUri,
        code: $codeStore,
        refreshToken: $refreshTokenStore,
      })
      .unauthorized(() => {
        continueRequest = false;
        codeStore.set(undefined);
      })
      .json<IHubSpotFormsResponse>();

    const response = await request;

    if (!continueRequest) {
      return;
    }

    forms = response.forms;
    refreshTokenStore.set(response.refreshToken);
    loading = false;
  };

  const t = translate(translations, [sharedTranslations]);
</script>

<CustomElement bind:value bind:config bind:disabled>
  {#if loading}
    <Loading />
  {:else}
    <div transition:fade>
      {#if !disabled}
        <div class="group">
          <!-- svelte-ignore a11y-no-onchange -->
          <select
            class="select"
            value={value.form && value.form.guid}
            on:change={(event) => event.currentTarget.value !== '' && (value.form = forms.find((form) => form.guid === event.currentTarget.value))}>
            <option value="">{$t('chooseForm')}</option>
            {#each forms as form (form.guid)}
              <option value={form.guid}>{form.name}</option>
            {/each}
          </select>
        </div>
      {/if}
      {#if value.form}
        <div class="group" transition:fade>
          <div class="group column">
            <div>{$t('previewDescription')}</div>
            <div class="form group column">
              <h3>{value.form.name}</h3>
              {#if showForm}
                {#each value.form.formFieldGroups as formFieldGroup}
                  {#each formFieldGroup.fields as field}
                    <!-- svelte-ignore a11y-label-has-associated-control -->
                    <label class="formRow">
                      <p class="label">
                        {#if field.required}
                          {field.label}
                          *
                        {:else}{field.label}{/if}
                      </p>
                      <p class="field">
                        {#if field.fieldType === 'text'}
                          <input
                            class="input"
                            name={field.name}
                            type="text"
                            placeholder={field.placeholder}
                            required={field.required}
                            value={field.defaultValue} />
                        {:else if field.fieldType === 'booleancheckbox'}
                          <input
                            class="input checkbox"
                            name={field.name}
                            type="checkbox"
                            placeholder={field.placeholder}
                            required={field.required}
                            value={field.defaultValue} />
                        {:else if field.fieldType === 'textarea'}
                          <textarea
                            class="input textarea"
                            name={field.name}
                            placeholder={field.placeholder}
                            required={field.required}
                            value={field.defaultValue} />
                        {/if}
                        {field.description}
                      </p>
                    </label>
                  {/each}
                {/each}
                <button class="button" on:click={() => (showForm = false)}>
                  {value.form.submitText}
                </button>
              {:else}
                <p>{value.form.inlineMessage}</p>
              {/if}
            </div>
            {#if !showForm}
              <button class="button" on:click={() => (showForm = true)}>
                {$t('reset')}
              </button>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  {/if}
  <div slot="loading">
    <Loading />
  </div>
  <div slot="invalid">
    <Invalid />
  </div>
</CustomElement>

<style>
  .form {
    width: 32em;
    border: 0.1em solid #ddd;
    display: flex;
    padding: 0.5em;
    border-radius: 0.3em;
  }

  .input {
    border: 0.1em solid #e0e0e0;
    height: 2em;
    min-width: 0;
    padding: 0.25em 0.5em;
  }

  .formRow {
    display: flex;
    padding: 0 0 1em 0;
  }

  .label {
    flex: 2;
    margin: 0;
    color: initial;
    font-weight: initial;
    font-size: initial;
  }

  .field {
    flex: 10;
    margin: 0;
  }

  .checkbox {
    width: 10%;
  }

  .textarea {
    height: auto;
  }

  .button {
    width: auto;
    margin: 0 auto;
  }
</style>
