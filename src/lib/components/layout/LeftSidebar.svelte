<script>
    import { ChevronDown, Menu, GripVertical, X } from 'lucide-svelte';
    import { themeIndex } from "$lib/stores.svelte.js";
    import { page } from '$app/stores';
    import { contentTree } from '$lib/data/pages.svelte.js';
    import { onMount } from 'svelte';

    let { children } = $props();
    
    let isCollapsed = $state(true);
    let sidebarWidth = 435;
    // let minWidth = 450;
    // let maxWidth = 450;
    let isDragging = false;
    
    const toggleSidebar = () => {
        isCollapsed = !isCollapsed;
    }

    // const startResize = () => {
    //     isDragging = true;
    //     document.addEventListener('mousemove', handleMouseMove);
    //     document.addEventListener('mouseup', stopResize);
    // }

    // const handleMouseMove = (event) => {
    //     if (isDragging)
    //         sidebarWidth = Math.max(minWidth, Math.min(maxWidth, event.clientX));
    // }

    // const stopResize = () => {
    //     isDragging = false;
    //     document.removeEventListener('mousemove', handleMouseMove);
    //     document.removeEventListener('mouseup', stopResize);
    // }

    let expandedItems = $state([]);

    onMount(() => {
        contentTree.children.forEach(item => {
            if (isParentRouteActive(item)) {
                if (!expandedItems.find(it => it == item.href))
                    expandedItems.push(item.href);

                if (item.children) {
                    item.children.forEach(child => {
                        if (isParentRouteActive(child) && !expandedItems.find(it => it == child.href))
                            expandedItems.push(child.href);
                    });
                }
            }
        });
    });

    const isRouteActive = (href) => {
        return $page.url.pathname === href;
    }

    const isParentRouteActive = (item) => {
        if (isRouteActive(item.href)) 
            return true;
        
        if (item.children) {
            return item.children.some(child => {
                if (isRouteActive(child.href)) 
                    return true;
                
                if (child.children)
                    return child.children.some(grandchild => isRouteActive(grandchild.href));

                return false;
            });
        }
        return false;
    }

    const toggleExpanded = (href) => {
        if (expandedItems.find(it => it == href))
            expandedItems.splice(expandedItems.findIndex(it => it == href), 1);
        else
            expandedItems.push(href);
    }
</script>

<div class="flex min-h-screen">
    {#if !isCollapsed}
        <div onclick={toggleSidebar} aria-hidden="true" class="absolute inset-0 bg-black/50 z-40 transition-all duration-300 ease-in-out opacity-0 {!isCollapsed && 'opacity-100'}"></div>
    {/if}

    <div class="relative">
        <aside class="z-50 h-screen flex flex-col justify-between { $themeIndex == 0 ? 'bg-gray-100 text-black' : 'bg-gray-800 text-white'} transition-transform duration-300 fixed transform {isCollapsed ? '-translate-x-full' : 'translate-x-0'} overflow-y-auto" style="width: {sidebarWidth}px">
            <div>
                <div class="flex flex-row justify-between items-center p-6 mb-6">
                    <a href="/home" class="relative w-12 h-12 me-4">
                        <img src="/assets/images/favicon-{ $themeIndex == 0 ? 'light' : 'dark' }.png" alt="logo"/>
                    </a>
                    
                    <div class="flex items-center">
                        <button onclick={toggleSidebar} class="p-1 rounded-lg { $themeIndex == 0 ? 'hover:bg-gray-300' : 'hover:bg-gray-700' } transition-colors" aria-label="Collapse sidebar">
                            <X size={18}/>
                        </button>
                    </div>
                </div>
                
                <nav class="flex flex-col gap-1 pe-4">
                    {#each contentTree.children as item}
                        {@const hasChildren = item.children}
                        <div class="flex flex-col">
                            <button onclick={() => toggleExpanded(item.href)} class="flex items-center gap-4 ps-2 p-1 mb-1 ms-4 rounded-lg transition-colors hover:bg-gray-300 { isRouteActive(item.href) && 'bg-gray-300'}">
                                <a href={item.href} class="flex items-center gap-4 flex-1 hover:no-underline text-black">
                                    <item.icon size={18}/>
                                    <span class="truncate">{item.href.split("/").pop().replaceAll('-', ' ')}</span>
                                </a>

                                {#if hasChildren}
                                    <ChevronDown size={16} class="transition-transform me-2 duration-200 {expandedItems.find(it => it == item.href) ? 'text-red-500' : 'rotate-90'}"/>
                                {/if}
                            </button>

                            {#if hasChildren && expandedItems.find(it => it == item.href)}
                                <div class="ms-4 border-l-2 border-gray-300 pl-2">
                                    {#each item.children as child}
                                        {@const hasGrandchildren = child.children}
                                        <div class="flex flex-col">
                                            <button onclick={() => toggleExpanded(child.href)} class="flex items-center gap-4 ps-2 p-1 mb-1 ms-4 rounded-lg transition-colors hover:bg-gray-300 {isRouteActive(child.href) && 'bg-gray-300'}">
                                                <a href={child.href} class="flex items-center gap-4 flex-1 hover:no-underline text-black">
                                                    <child.icon size={18}/>
                                                    <span class="truncate">{child.href.split("/").pop().replaceAll('-', ' ')}</span>
                                                </a>

                                                {#if hasGrandchildren}
                                                    <ChevronDown size={16} class="transition-transform duration-200 me-2 {expandedItems.find(it => it == child.href) ? 'text-red-500' : 'rotate-90'}"/>
                                                {/if}
                                            </button>

                                            {#if hasGrandchildren && expandedItems.find(it => it == child.href)}
                                                <div class="pl-2 border-l-2 ml-4 border-gray-300">
                                                    {#each child.children as grandchild}
                                                        <a href={grandchild.href} class="flex items-center gap-4 ps-2 p-1 mb-1 ms-4 rounded-lg hover:no-underline text-black transition-colors hover:bg-gray-300 {isRouteActive(grandchild.href) && 'bg-gray-300'}">
                                                            <grandchild.icon size={18}/>
                                                            <span class="flex-1 truncate">{grandchild.href.split("/").pop().replaceAll('-', ' ')}</span>
                                                        </a>
                                                    {/each}
                                                </div>
                                            {/if}
                                        </div>
                                    {/each}
                                </div>
                            {/if}
                        </div>
                    {/each}
                </nav>
            </div>

            <div class="flex flex-row justify-center items-center mt-8 mb-4">
                <p class="text-xl m-0">Computer</p>
                <img src="/assets/images/favicon-{ $themeIndex == 0 ? 'light' : 'dark' }.png" alt="icon" class="w-8 h-8 mx-2">
                <p class="text-xl m-0">Graphics</p>
            </div>

            <!-- <div on:mousedown={startResize} class="absolute top-0 right-0 w-4 h-full cursor-col-resize flex items-center justify-center hover:bg-gray-500/20 transition-colors">
                <div class="p-1 rounded-md { $themeIndex == 0 ? 'text-gray-400' : 'text-gray-500' }">
                    <GripVertical size={16} />
                </div>
            </div> -->
        </aside>
    </div>

    <div class="flex-1">
        <button onclick={toggleSidebar} class="fixed top-4 left-4 z-10 p-1 rounded-lg hover:bg-gray-300 transition-colors" aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
            <Menu size={18}/>
        </button>

        <div class="p-4">
            {@render children?.()}
        </div>
    </div>

    {#if isDragging}
        <div class="fixed inset-0 z-[100] cursor-col-resize"></div>
    {/if}
</div>