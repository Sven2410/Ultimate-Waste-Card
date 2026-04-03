# Ultimate Waste Card

A custom Lovelace card for Home Assistant that displays waste collection dates as elegant glass-style chips. Designed for use with [MijnAfvalwijzer](https://github.com/xirixiz/homeassistant-afvalwijzer) and similar integrations.

## Features

- **17 predefined waste types** — Restafval, GFT, PMD, Papier, Textiel, Glas, Grofvuil, and more, each with their own icon and color
- **Smart date detection** — automatically shows "Vandaag" (today) or "Morgen" (tomorrow) with highlighted borders
- **Glass morphism chips** — frosted glass design with smooth hover effects
- **Click for details** — tap any chip to open the entity's more-info dialog
- **Visual GUI editor** — add and remove waste types with a dropdown selector and entity picker, with auto-suggested entity names
- **Fully configurable** — choose only the waste types relevant to your municipality

## Supported Waste Types

| Type | Name | Icon | Color |
|------|------|------|-------|
| `restafval` | Restafval | ♻️ | Grey |
| `gft` | GFT | 🍎 | Green |
| `papier` | Papier | 📰 | Blue |
| `pmd` | PMD | 🧴 | Orange |
| `gftgratis` | GFT gratis | 🌿 | Light green |
| `textiel` | Textiel | 👕 | Brown |
| `glas` | Glas | 🥛 | Teal |
| `grofvuil` | Grofvuil | 🛋️ | Brown |
| `asbest` | Asbest | ⚠️ | Red |
| `apparaten` | Apparaten | 🧺 | Indigo |
| `chemisch` | Chemisch | 🧪 | Purple |
| `sloopafval` | Sloopafval | 🔨 | Blue-grey |
| `takken` | Takken | 🌳 | Dark green |
| `pbd` | PBD | 📦 | Amber |
| `duobak` | Duobak | 🗑️ | Grey |
| `restwagen` | Restwagen | 🚛 | Grey |
| `sortibak` | Sortibak | 🔀 | Cyan |

## Installation

### HACS (recommended)

1. Open HACS in Home Assistant
2. Go to **Frontend** → click the **⋮** menu → **Custom repositories**
3. Add `https://github.com/Sven2410/ultimate-waste-card` with category **Dashboard**
4. Click **Install**
5. Refresh your browser (hard refresh: Ctrl+Shift+R)

### Manual

1. Download `ultimate-waste-card.js` from the [latest release](https://github.com/Sven2410/ultimate-waste-card/releases/latest)
2. Copy it to `/config/www/ultimate-waste-card.js`
3. Add the resource in **Settings → Dashboards → ⋮ → Resources**:
   - URL: `/local/ultimate-waste-card.js`
   - Type: JavaScript Module

## Configuration

### Visual Editor

1. Add a card to your dashboard
2. Search for **Ultimate Waste Card**
3. Use the dropdown to select a waste type — it auto-suggests the entity name
4. Click **+ Toevoegen** to add it
5. Repeat for each waste type you need

### YAML

```yaml
type: custom:ultimate-waste-card
name: Afvalwijzer
items:
  - type: pmd
    entity: sensor.mijnafvalwijzer_pmd
  - type: gft
    entity: sensor.mijnafvalwijzer_gft
  - type: restafval
    entity: sensor.mijnafvalwijzer_restafval
  - type: papier
    entity: sensor.mijnafvalwijzer_papier
```

| Option  | Type   | Required | Description                             |
|---------|--------|----------|-----------------------------------------|
| `name`  | string | No       | Optional card title (not displayed on card) |
| `items` | array  | **Yes**  | List of waste type configurations       |

Each item in `items`:

| Option   | Type   | Required | Description                              |
|----------|--------|----------|------------------------------------------|
| `type`   | string | **Yes**  | One of the predefined waste types        |
| `entity` | string | **Yes**  | A `sensor.*` entity for the collection date |

## Screenshots

_Coming soon_

## License

MIT
