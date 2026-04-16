<template>
  <div>
    <NuxtPage />
  </div>
</template>

<style>
:root,
[data-theme='light'] {
  --color-bg: #f7f6f2;
  --color-surface: #f9f8f5;
  --color-surface-2: #fbfbf9;
  --color-surface-offset: #f3f0ec;
  --color-border: #d4d1ca;
  --color-text: #28251d;
  --color-text-muted: #7a7974;
  --color-text-faint: #bab9b4;
}

[data-theme='dark'] {
  --color-bg: #171614;
  --color-surface: #1c1b19;
  --color-surface-2: #201f1d;
  --color-surface-offset: #22211f;
  --color-border: #393836;
  --color-text: #cdccca;
  --color-text-muted: #979694;
  --color-text-faint: #6b6a68;
}

html {
  color-scheme: light;
}

html[data-theme='dark'] {
  color-scheme: dark;
}

body {
  margin: 0;
  min-height: 100vh;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

a {
  color: inherit;
  text-decoration: none;
}

img {
  display: block;
  max-width: 100%;
}
</style>
