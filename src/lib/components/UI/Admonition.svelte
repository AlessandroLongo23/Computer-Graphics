<script>
    import * as ls from 'lucide-svelte'
    import { onMount } from 'svelte';
    import { admonitions } from '$lib/data/admonitions.svelte.js';
    import { capitalize } from '$lib/utils.svelte.js';
    import { convertToLatex } from '$lib/utils.svelte.js';

    let { type = 'note', title = '', textContent } = $props();

    let ad = $derived(admonitions.find(admonition => admonition.name === type));

    onMount(async () => {
        if (typeof window !== 'undefined')
            convertToLatex();
    });
</script>

{#if ad}
    <div class="{ad.backgroundColor} border-l-8 {ad.borderColor} text-black p-4 rounded-lg mb-4">
        <div class="flex flex-row justify-start items-center gap-4 mb-4">
            <ad.icon size={20} class={ad.iconColor}/>
            <p class="m-0 font-bold {ad.iconColor}">{title || capitalize(ad.name)}</p>
        </div>
        {@render textContent?.()}
    </div>
{/if}