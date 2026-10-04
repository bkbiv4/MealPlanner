# Meal Planner — initial product design

## Purpose

Create a practical weekly meal plan that fits diet preferences, daily macro targets, available cooking time, and ingredient freshness. Connect meals, shopping, preparation, and leftovers in one editable schedule.

## Planning inputs

- People and servings; individual nutrition targets when sharing meals.
- Diet preferences: balanced, keto, higher carbohydrate, vegetarian, or custom.
- Optional calorie, protein, carbohydrate, and fat targets, with user-selected tolerance ranges.
- Optional different targets by day, such as higher carbohydrate days tied to a user-selected activity or event.
- Allergies, excluded ingredients, dislikes, preferred recipes, and variety preferences.
- Budget, pantry inventory, kitchen equipment, and willingness to repeat meals.
- Meal times, available shopping and prep windows, maximum active cooking time, and freezer access.

Diet labels should be editable presets, not assumed medical prescriptions. The user supplies or confirms targets. Allergies and ingredient exclusions are hard constraints. If a diet preset and explicit macro targets conflict, explain the conflict and let the user choose which to change.

## Main experience

1. Set preferences and targets.
2. Enter availability manually; add calendar integration in a later release.
3. Generate a seven-day plan with meals, daily nutrition totals, grocery quantities, and prep sessions.
4. Review conflicts and tradeoffs before accepting the plan.
5. Swap meals, adjust servings, lock favorites, and regenerate only unlocked items.
6. Follow the shopping and prep checklist during the week.
7. Record what was eaten, skipped, or left over to improve the next plan.

## Screens

### Setup

Diet presets, macro targets, household size, exclusions, budget, and time preferences. Targets can vary by day. Make all preset values visible and editable.

### Weekly plan

Seven-day meal view with recipe cards and daily macro totals. Each card shows servings, active cooking time, whether it uses leftovers, and any associated prep task. Allow a list view on small screens.

### Prep schedule

Timeline of shopping, batch cooking, thawing, reheating, and fresh preparation. Show why a session was suggested and allow it to be moved. Recalculate affected meals when prep moves.

### Grocery list

Consolidate recipe quantities, subtract confirmed pantry stock, group by shopping category, and distinguish required quantity from suggested package purchases. Track ingredient reuse across meals.

### Recipe detail

Ingredients, quantities, servings, nutrition source and estimates, active and total preparation time, equipment, instructions, and sourced storage guidance.

## Scheduling behavior

Start with available windows and meal deadlines, then propose feasible shopping and preparation sessions. Prefer fewer sessions when they fit time and storage constraints. Offer a main prep session and a smaller refresh when that improves quality or feasibility; do not assume a fixed Sunday routine.

Separate active work from unattended cooking time. Account for shared equipment, recipe dependencies, shopping travel, cooling, and cleanup. A meal cannot depend on preparation scheduled after its serving time.

Use ingredient perishability and recipe-specific storage guidance to choose earlier meals, fresh preparation, or freezing. Keep quality preferences separate from food-safety limits. Do not invent storage windows; verify authoritative guidance before implementing safety rules. Flag unavailable guidance explicitly.

Explain recommendations in ordinary language, such as: “This is your longest available cooking window,” or “Prepare this component closer to the meal for better texture.”

## Plan generation

Apply hard constraints first: allergies, exclusions, required serving counts, available equipment, feasible preparation windows, and verified storage limits.

Then rank feasible plans by closeness to nutrition targets, cost, active cooking time, ingredient reuse, variety, and user quality preferences. Let the user adjust these priorities. Nutrition totals are estimates tied to ingredient quantities and data sources.

If no feasible plan exists, show the unmet constraint and concrete alternatives. Never silently violate an allergy or claim exact nutrition matching. Preserve locked meals during regeneration and explain how substitutions change daily totals and prep tasks.

## Initial data model

- Household profile and individual preferences
- Diet preset and daily nutrition target
- Ingredient, nutrition reference, and pantry quantity
- Recipe, ingredient quantities, yield, steps, equipment, and storage reference
- Weekly plan and meal assignment
- Availability window and prep task with dependencies
- Grocery item and purchase status
- Prepared batch and leftover allocation

## First release

Build a responsive web app with manual availability, a curated recipe library, editable diet presets and macro targets, weekly plan generation, meal swaps, a grocery list, and a prep timeline. Persist user changes locally for the prototype.

Later releases can add account sync, calendar connections, nutrition-provider integration, recipe imports, price data, and feedback-driven recommendations. Calendar writes require the user to choose and authorize the destination.

## Acceptance criteria

- Excluded ingredients never appear in generated or swapped meals.
- Scaling servings updates ingredient quantities, grocery requirements, and nutrition estimates consistently.
- Every scheduled meal has a feasible preparation path within the user's availability.
- Changing a meal updates the grocery list and affected preparation tasks.
- Locked meals survive regeneration.
- Unmet nutrition targets and scheduling conflicts are visible and explainable.
- Leftovers are allocated from actual batch yield without double counting.
- Storage recommendations identify their source and distinguish safety from quality.

## Decisions to confirm

Choose whether the next deliverable is a clickable prototype, working web app, or personal planning system. Before building a working app, confirm whether it serves one person or a household and whether macro targets are entered manually or supplied by another source.
