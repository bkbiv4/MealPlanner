# Gather — Meal Planner

A responsive meal-planning web app. Includes editable diet presets and daily macro targets, a seven-day menu, meal swaps and locks, recipe instructions, household-scaled grocery quantities, a suggested cooking schedule, printing, browser-local meal-plan persistence, and a SQLite food library with automatic nutrition-image reading.

## Run

Requires Node.js 24 or later (uses built-in SQLite). On this computer, bundled OCR dependencies are detected automatically. On another computer, install the package.json dependencies before using image reading.

```sh
node server.js
```

Open http://localhost:3000. Run checks with `node --test`.

## Current scope

Nutrition totals are illustrative estimates, not sourced clinical or food-database values. Targets apply equally to every person and every day. Diet presets guide macro optimization; only vegetarian and ingredient exclusions act as ingredient constraints. Exclusions match ingredient names, so this is not an allergen certification tool.

The schedule fits summed recipe cooking durations into a daily budget and suggests dinner start times. It does not yet model actual calendar windows, batch storage, leftovers, food-safety limits, cleanup, household batch timing, or grocery travel. Meals are planned for fresh preparation; no storage windows are invented. Shopping is suggested on the selected day on or before the week starts.

Meal plans stay in this browser's local storage. Products are saved by the local server in `data/gather.sqlite`, with a separate price-history table. Back up that directory while the server is stopped. There is no account or external calendar integration. Google Fonts is optional; system font fallbacks work offline.

## Food library

Paste a Walmart product link in Food Library and click Read link. The server reads publicly exposed Product JSON-LD and Walmart main-item page data, then automatically reads supported nutrition-label images with local Tesseract.js OCR. The first OCR run downloads English recognition data, which is cached locally in `data/ocr`. Images are processed locally and temporary image files are deleted afterward; no image is sent to an AI/OCR service. On this machine the bundled dependencies are used automatically. On another machine install the dependencies in package.json with your Node package manager, or set `GATHER_NODE_MODULES` to an existing dependency directory.

Recognized text, engine, confidence, warnings, and extraction date are stored with saved products. Explicit nutrient amounts fill editable fields; missing values stay blank. OCR can misread numbers, so compare fields with the source label. Percent daily values are not converted into amounts. Letter O beside a nutrient unit may be normalized to zero with a review warning. Package totals use label serving counts and may reflect label rounding. The Read nutrition image button fills only blank fields on an existing draft.

Retailer challenges and unreadable labels require manual entry or pasted text. This is best-effort import, not an official Walmart integration. No login, CAPTCHA bypass, or location spoofing is used. The local Node server needs outbound internet access. Import progress and errors appear directly below the link field; requests time out rather than leaving the button stuck. Supported image hosts are `images.salsify.com`, `i5.walmartimages.com`, and `i5.walmartimages.ca`; image type, size, redirects, and processing time are bounded.

Review item name, package size, current listed price, any separately displayed original/discounted price, serving size, servings per package, and nutrient amounts. Prices are USD per package before taxes/fees. Nutrients are per serving; unknown values are null rather than zero. Sources, observation timestamps, store context, and a review checkbox are retained. The same Walmart item ID updates one product. Changes to price snapshots append history. Export JSON downloads saved products; history remains in SQLite.

Food Library products can be combined in Batch meals. Generated recipes still use illustrative nutrition; scheduled batches use saved product label amounts. Different variants and formulations need separate item links. You may also supply links in chat for researched entries.

## Batch meals

Create a named batch from Food Library products and specify a whole-number yield of meal portions. Ingredient quantities accept packages (including fractions), label servings, or grams/pieces with an explicit whole-package conversion. Do not mix raw and cooked quantity bases. Unknown package serving counts prevent package-based nutrition calculations; explicit label-serving quantities can still calculate label nutrition. Missing nutrient or price contributions make totals incomplete; known nutrition subtotals are separately labeled.

Ingredient cost uses the amount consumed. Shopping cost rounds aggregate product use up to whole packages and assumes no packages are on hand. Unused package quantities are estimates, not changes to a pantry stock ledger. Values recalculate from the latest saved product records.

Saved batches and their dated meal assignments live in SQLite. Allocate a total number of household portions to breakfast, lunch, or dinner. Assignments cannot exceed batch yield or collide with another batch. They replace generated meals in the menu, daily nutrition, prep display, and grocery list. Nutrition is shown as an average per person using the planner household size. Assignments persist through menu regeneration and across weeks; create another batch to represent another cooking run. Grocery requirements include each whole batch once when any portion is assigned that week. Batch prep time is entered manually; safe storage intervals, inventory, and automatic prep-time optimization remain future work.

`node seed-example.js` adds the researched Jimmy Dean example only if it does not already exist. It does not refresh prices. Sources and research context are saved with the record.
