<script>
    import CodeBlock from '$lib/components/CodeBlock.svelte';
    import Canvas from '$lib/components/Canvas.svelte';
    
    import Toggle from '$lib/components/UI/Toggle.svelte';
    import { Code, Columns2, Play } from 'lucide-svelte';

    let {
        viewIndex = $bindable(),
        canvas = $bindable(),
        isLoading,
        codeSnippets,
        folderPath,
        width = 512,
        controls
    } = $props();
</script>

<div class="mx-auto my-4">
    <Toggle bind:selected={viewIndex} icons={[Code, Columns2, Play]}/>
</div>

<div class="flex flex-row justify-evenly items-center m-auto">
    <div class="{viewIndex !== 2 ? 'visible' : 'hidden'} w-full">
        {#if !isLoading}
            <CodeBlock codeSnippets={codeSnippets} viewIndex={viewIndex} folderPath={folderPath} style="width: {viewIndex == 1 ? '768' : '1024'}px; height: 512px;"/>
        {:else}
            <p>Loading code snippets...</p>
        {/if}
    </div>

    <Canvas bind:canvas={canvas} viewIndex={viewIndex} width={width}>
        {#snippet contr()}
            {@render controls?.()}
        {/snippet}
    </Canvas>
</div>