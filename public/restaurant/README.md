# Ember & Oak — Premium Restaurant Self-Ordering Interface

Standalone HTML5 / CSS3 / Vanilla JavaScript template. No frameworks, no build step, no backend — designed to be converted into Laravel Blade later.

## Files

```
menu.html           — page markup (semantic, Blade-conversion friendly)
css/styles.css      — all styles + design tokens in one file
js/menu-data.js     — sample menu, categories and branches (demo data)
js/app.js           — interactions: categories, search, filters, cart
assets/img/         — food photography (relative paths)
```

## What works out of the box

- Category navigation with counts and active indicator ("Show All", Pizza, Burger, Pasta, Rice, Chicken, Dessert, Drinks)
- Menu search with clear button, vegetarian-only filter, and sorting
- Add to Cart with live cart badge, toast feedback and a slide-in cart drawer (quantity steppers, total)
- Branch selector, Call Waiter button (demo toast), mobile navigation drawer
- Responsive: desktop, laptop, tablet, mobile and touchscreen kiosk (`pointer: coarse` sizes up targets)
- Empty state when no dishes match

## Laravel integration notes

- No backend, database, auth or API calls are made anywhere.
- All asset references are **relative** (`css/styles.css`, `assets/img/...`) — safe for Blade layouts.
- `js/menu-data.js` is the only demo data. Replace it by rendering the same shape from Blade:
  - Categories: `[{ id, name, thumb }]`
  - Menu: `[{ id, name, description, category, price, image, isVeg, prepTime, rating, featured }]`
  - Branches: `[{ id, name, address }]`
  or echo a JSON payload into a `<script>` block and skip `menu-data.js` entirely.
- Cart state lives in a client-side `Map` in `js/app.js`; hook your Laravel routes into
  `addToCart` / `changeQty` / the `#checkoutBtn` handler.
- Prices are plain numbers; `money()` in `app.js` formats them — swap the formatter for your currency.
- Links (Home, Book a Table, About, Contact) are placeholder `href="#"` anchors — point them at your route names.
