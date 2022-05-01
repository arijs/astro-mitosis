import { defineConfig } from 'astro/config';
  import preact from '@astrojs/preact';
  import react from '@astrojs/react';
  import solid from '@astrojs/solid-js';
  import svelte from '@astrojs/svelte';
  import vue from '@astrojs/vue';
// https://astro.build/config
export default defineConfig({
  integrations: [
    preact(),
    react(),
    solid(),
    svelte(),
    vue(),
  ]
});