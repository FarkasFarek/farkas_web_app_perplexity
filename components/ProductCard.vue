<template>
  <!-- ── Skeleton ── -->
  <div
    v-if="!product"
    class="pc pc--skeleton"
    aria-hidden="true"
  >
    <div class="pc__img-wrap pc__img-wrap--skel" />
    <div class="pc__body">
      <div class="skel skel--brand" />
      <div class="skel skel--name" />
      <div class="skel skel--name skel--name-short" />
      <div class="skel skel--price" />
      <div class="skel skel--btn" />
    </div>
  </div>

  <!-- ── Content ── -->
  <article v-else class="pc">
    <!-- Image -->
    <div class="pc__img-wrap">
      <img
        v-if="product.image_url"
        :src="product.image_url"
        :alt="product.name"
        loading="lazy"
        decoding="async"
        class="pc__img"
        @error="handleImgError"
      />
      <!-- Fallback: neutral bg + brand initials in Instrument Serif -->
      <div
        v-else
        class="pc__img-fallback"
        role="img"
        :aria-label="product.name"
      >
        <span class="pc__initials" aria-hidden="true">{{ brandInitials }}</span>
      </div>
    </div>

    <!-- Body -->
    <div class="pc__body">
      <!-- Brand -->
      <p class="pc__brand">{{ product.brand }}</p>

      <!-- Product name -->
      <h3 class="pc__name">{{ product.name }}</h3>

      <!-- Price -->
      <p class="pc__price">{{ priceLabel }}</p>

      <!-- Description (optional) -->
      <p v-if="product.description" class="pc__desc">{{ product.description }}</p>

      <!-- CTA -->
      <a
        v-if="product.affiliate_url"
        :href="product.affiliate_url"
        target="_blank"
        rel="noopener noreferrer"
        class="pc__cta"
      >
        Megnézem →
      </a>
      <span v-else class="pc__no-link">Ár lekérdezésre</span>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Product } from '~/types/climahub'

const props = defineProps<{ product?: Product }>()

const brandInitials = computed(() => {
  if (!props.product?.brand) return '?'
  return props.product.brand
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
})

const priceLabel = computed(() => {
  if (!props.product) return ''
  const { price_min, price_max } = props.product
  const fmt = (n: number) => n.toLocaleString('hu-HU') + '\u00a0Ft'
  if (price_min != null && price_max != null) return `${fmt(price_min)} \u2013 ${fmt(price_max)}`
  if (price_min != null) return `${fmt(price_min)}-tól`
  if (price_max != null) return `${fmt(price_max)}-ig`
  return 'Ár lekérdezésre'
})

function handleImgError(e: Event) {
  ;(e.target as HTMLImageElement).style.display = 'none'
}
</script>

<style scoped>
/* ─────────────────────────────────────────
   Card shell
───────────────────────────────────────── */
.pc {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  cursor: pointer;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  transition:
    transform var(--transition-interactive),
    box-shadow var(--transition-interactive),
    border-color var(--transition-interactive);
}
.pc:not(.pc--skeleton):hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* ─────────────────────────────────────────
   Image area  (4:3)
───────────────────────────────────────── */
.pc__img-wrap {
  display: block;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: var(--color-surface-offset);
  flex-shrink: 0;
}
.pc__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 400ms cubic-bezier(0.16, 1, 0.3, 1);
}
.pc:hover .pc__img { transform: scale(1.04); }

/* Fallback: semleges szürke + Instrument Serif initials */
.pc__img-fallback {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-offset);
}
.pc__initials {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: var(--text-2xl);
  color: var(--color-text-faint);
  user-select: none;
  line-height: 1;
}

/* ─────────────────────────────────────────
   Body
───────────────────────────────────────── */
.pc__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: var(--space-4);
  gap: var(--space-2);
}

/* Brand */
.pc__brand {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: var(--space-1);
  max-width: none;
}

/* Product name */
.pc__name {
  font-family: 'Satoshi', system-ui, sans-serif;
  font-size: var(--text-base);
  font-weight: 600;
  line-height: 1.35;
  color: var(--color-text);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Price */
.pc__price {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-primary);
  font-variant-numeric: tabular-nums;
  margin: var(--space-2) 0;
  max-width: none;
}

/* Description */
.pc__desc {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: var(--space-4);
  max-width: none;
}

/* No link fallback */
.pc__no-link {
  margin-top: auto;
  font-size: var(--text-xs);
  color: var(--color-text-faint);
}

/* ─────────────────────────────────────────
   CTA button — "Megnézem →"
───────────────────────────────────────── */
.pc__cta {
  display: block;
  width: 100%;
  margin-top: auto;
  padding: var(--space-2) var(--space-4);
  background: var(--color-primary);
  color: #ffffff;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
  text-align: center;
  text-decoration: none;
  transition:
    background var(--transition-interactive),
    box-shadow var(--transition-interactive);
}
.pc__cta:hover {
  background: var(--color-primary-hover);
}
.pc__cta:active {
  background: var(--color-primary-active);
}
.pc__cta:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 3px;
}

/* ─────────────────────────────────────────
   Skeleton
───────────────────────────────────────── */
.pc--skeleton { pointer-events: none; }

.pc__img-wrap--skel {
  animation: pc-pulse 1.5s ease-in-out infinite;
}

.skel {
  border-radius: var(--radius-sm);
  background: var(--color-surface-offset);
  animation: pc-pulse 1.5s ease-in-out infinite;
}

.skel--brand      { height: 0.7em;   width: 35%; border-radius: var(--radius-full); }
.skel--name       { height: 1em;     width: 90%; margin-top: var(--space-1); }
.skel--name-short { width: 65%; }
.skel--price      { height: 1.25em;  width: 50%; margin-top: var(--space-2); }
.skel--btn        { height: 2.25rem; width: 100%; border-radius: var(--radius-md); margin-top: var(--space-3); }

@keyframes pc-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.45; }
}
</style>
