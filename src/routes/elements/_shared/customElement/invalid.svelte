<script lang="ts">
  import { translate } from "../../../../utilities/translateStore";
  import sharedTranslations from "../resources";

  const t = translate(sharedTranslations);
</script>

<a href={$t('documentationUrl')} target="_blank">{$t('whatToDo')}</a>.
