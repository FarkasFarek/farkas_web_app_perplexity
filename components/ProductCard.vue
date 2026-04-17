<template>
  <!-- Skeleton -->
  <div
    v-if="!product"
    class="product-card product-card--skeleton"
    aria-hidden="true"
  >
    <div class="product-card__img-placeholder" />
    <div class="product-card__body">
      <div class="skel skel--xs" />
      <div class="skel" />
      <div class="skel skel--med" />
      <div class="skel skel--price" />
      <div class="skel skel--btn" />
    </div>
  </div>

  <!-- Content -->
  <article v-else class="product-card">
    <!-- Image -->
    <div class="product-card__img-wrap">
      <img
        v-if="product.image_url"
        :src="product.image_url"
        :alt="product.name"
        loading="lazy"
        decoding="async"
        class="product-card__img"
        @error="handleImgError"
      />
      <div
        v-else
        class="product-card__img-fallback"
        role="img"
        :aria-label="product.name"
      >
        <span class="product-card__initials" aria-hidden="true">{{ brandInitials }}</span>
      </div>
    </div>

    <!-- Body -->
    <div class="product-card__body">
      <p class="product-card__brand">{{ product.brand }}</p>
      <h3 class="product-card__name">{{ product.name }}</h3>
      <p class="product-card__price">{{ priceLabel }}</p>

      <a
        v-if="product.affiliate_url"
        :href="product.affiliate_url"
        target="_blank"
        rel="noopener noreferrer"
        class="product-card__cta"
      >
        Megnézem
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </a>
      <span v-else class="product-card__no-price">Ár lekérdezésre</span>
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
  if (price_min != null) return `${fmt(price_min)}-t\u00f3l`
  if (price_max != null) return `${fmt(price_max)}-ig`
  return '\u00c1r lek\u00e9rdez\u00e9sre'
})

function handleImgError(e: Event) {
  ;(e.target as HTMLImageElement).style.display = 'none'
}
</script>

<style scoped>
/* --- Card shell --- */
.product-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  transition:
    box-shadow var(--transition-ui),
    transform var(--transition-ui),
    border-color var(--transition-ui);
}
.product-card:not(.product-card--skeleton):hover {
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-2px);
  border-color: color-mix(in oklch, var(--color-primary) 20%, var(--color-border));
}

/* --- Skeleton --- */
.product-card--skeleton { pointer-events: none; }
.product-card__img-placeholder {
  aspect-ratio: 4 / 3;
  background-image: linear-gradient(
    90deg,
    var(--color-surface-offset) 25%,
    var(--color-divider) 50%,
    var(--color-surface-offset) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}
.skel {
  height: 0.9em;
  border-radius: var(--radius-sm);
  background-image: linear-gradient(
    90deg,
    var(--color-surface-offset) 25%,
    var(--color-divider) 50%,
    var(--color-surface-offset) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}
.skel--xs    { width: 28%; height: 0.7em; }
.skel--med   { width: 68%; }
.skel--price { width: 42%; }
.skel--btn   { height: 2.25rem; border-radius: var(--radius-md); margin-top: var(--space-3); }
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}

/* --- Image --- */
.product-card__img-wrap {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: var(--color-surface-offset);
}
.product-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 400ms cubic-bezier(0.16, 1, 0.3, 1);
}
.product-card:hover .product-card__img { transform: scale(1.04); }

.product-card__img-fallback {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-offset);
}
.product-card__initials {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-faint);
  letter-spacing: -0.02em;
  user-select: none;
}

/* --- Body --- */
.product-card__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4);
}
.product-card__brand {
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--color-text-faint);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  max-width: none;
}
.product-card__name {
  font-size: var(--text-base);
  font-weight: 600;
  line-height: 1.35;
  color: var(--color-text);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.product-card__price {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-primary);
  max-width: none;
}
.product-card__no-price {
  margin-top: auto;
  font-size: var(--text-xs);
  color: var(--color-text-faint);
}

/* --- CTA button --- */
.product-card__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  margin-top: auto;
  padding: 0.55rem var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
  color: #fff;
  background: var(--color-primary);
  border: none;
  text-decoration: none;
  transition:
    background var(--transition-ui),
    box-shadow var(--transition-ui),
    transform var(--transition-ui);
}
.product-card__cta:hover {
  background: var(--color-primary-hover);
  box-shadow: 0 4px 12px var(--color-primary-ring);
  transform: translateY(-1px);
}
.product-card__cta:active {
  background: var(--color-primary-active);
  transform: translateY(0);
  box-shadow: none;
}
</style>
