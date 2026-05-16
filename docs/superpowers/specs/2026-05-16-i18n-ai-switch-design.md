# OCRLabel — i18n + AI Backend Switch Design Spec
Date: 2026-05-16

## Overview

Two additive features on top of the existing OCRLabel Electron app:

1. **Language switch (EN ↔ NL):** App UI strings switchable between English and Dutch. Printed label output is always Dutch (NL food label law). Language persisted in config.json.

2. **AI backend switch (Claude ↔ Ollama):** Users can choose between Anthropic Claude (cloud, API key) or Ollama (local, no API key). Claude supports an optional base URL override for local proxies. Ollama uses a configurable host + model name.

---

## Feature 1: i18n

### Architecture

- `src/i18n.js` — exports `EN` and `NL` string dictionaries (identical keys), `LanguageContext`, and `useT()` hook
- `useT()` returns the active dictionary object; components call `t('save')`, `t('settings')`, etc.
- `LanguageContext` wraps the entire app in `src/App.jsx`
- Language state initialized from `config.json` (`language` key, default `'en'`)
- Language persisted via `window.api.config.set('language', lang)` on toggle
- Nav bar has `EN | NL` buttons — click switches immediately, no save required

### String Keys (~40)

All UI-facing strings in: App nav, Home, NewLabel, Settings, LabelForm, LabelPreview (`Netto gewicht` is label content, stays Dutch).

```js
// src/i18n.js — representative keys
const EN = {
  // Nav
  nav_labels: 'Labels',
  nav_new: '+ New',
  nav_settings: 'Settings',
  // Home
  home_title: 'Labels',
  home_new_btn: '+ New Label',
  home_empty: 'No labels yet.',
  home_col_date: 'Date',
  home_col_product: 'Product',
  home_col_weight: 'Net weight',
  home_col_printed: 'Printed',
  home_col_actions: 'Actions',
  home_btn_reprint: 'Reprint',
  home_btn_delete: 'Delete',
  home_confirm_delete: 'Delete this label?',
  home_loading: 'Loading…',
  // NewLabel
  new_title: 'New Label',
  new_btn_back: '← Back',
  new_btn_pick: '📷 Choose Image',
  new_btn_picking: 'Extracting…',
  new_tab_edit: 'Edit',
  new_tab_preview: 'Preview',
  new_err_extract: 'Could not extract product data. Fill in fields manually.',
  new_btn_print: '🖨 Print',
  new_btn_edit: '← Edit',
  // LabelForm
  form_product_name: 'Product name',
  form_ingredients: 'Ingrediënten',
  form_allergens: 'Allergens (Kan bevatten)',
  form_storage: 'Storage (Bewaren)',
  form_manufacturer: 'Manufacturer / Importer',
  form_net_weight: 'Net weight',
  form_nutrition_header: 'Nutrition per 100g',
  form_energy_kj: 'Energy (kJ)',
  form_energy_kcal: 'Energy (kcal)',
  form_fat: 'Fat (g)',
  form_fat_sat: 'of which saturated (g)',
  form_carbs: 'Carbohydrates (g)',
  form_carbs_sugars: 'of which sugars (g)',
  form_fiber: 'Fibre (g)',
  form_protein: 'Protein (g)',
  form_salt: 'Salt (g)',
  form_save_btn: 'Save & Preview →',
  // Settings
  settings_title: 'Settings',
  settings_language: 'Language',
  settings_ai_backend: 'AI Backend',
  settings_claude_key: 'Anthropic API Key',
  settings_claude_key_hint: 'Available at console.anthropic.com',
  settings_claude_base_url: 'Base URL (optional)',
  settings_claude_base_url_hint: 'Leave blank for api.anthropic.com',
  settings_ollama_host: 'Ollama Host',
  settings_ollama_model: 'Ollama Model',
  settings_printer: 'Printer Name',
  settings_printer_hint: 'Must match exactly as shown in Windows Printers',
  settings_save_btn: 'Save',
  settings_saved: 'Saved!',
}

const NL = {
  // Nav
  nav_labels: 'Etiketten',
  nav_new: '+ Nieuw',
  nav_settings: 'Instellingen',
  // Home
  home_title: 'Etiketten',
  home_new_btn: '+ Nieuw etiket',
  home_empty: 'Nog geen etiketten aangemaakt.',
  home_col_date: 'Datum',
  home_col_product: 'Product',
  home_col_weight: 'Netto',
  home_col_printed: 'Afgedrukt',
  home_col_actions: 'Acties',
  home_btn_reprint: 'Herdruk',
  home_btn_delete: 'Verwijder',
  home_confirm_delete: 'Etiket verwijderen?',
  home_loading: 'Laden…',
  // NewLabel
  new_title: 'Nieuw etiket',
  new_btn_back: '← Terug',
  new_btn_pick: '📷 Afbeelding kiezen',
  new_btn_picking: 'Herkennen…',
  new_tab_edit: 'Bewerken',
  new_tab_preview: 'Voorbeeld',
  new_err_extract: 'Kon geen productgegevens herkennen. Vul de velden handmatig in.',
  new_btn_print: '🖨 Afdrukken',
  new_btn_edit: '← Bewerken',
  // LabelForm
  form_product_name: 'Productnaam',
  form_ingredients: 'Ingrediënten',
  form_allergens: 'Kan bevatten (allergenen)',
  form_storage: 'Bewaren (opslaginfo)',
  form_manufacturer: 'Fabrikant / Importeur',
  form_net_weight: 'Netto gewicht',
  form_nutrition_header: 'Voedingswaarden per 100g',
  form_energy_kj: 'Energie (kJ)',
  form_energy_kcal: 'Energie (kcal)',
  form_fat: 'Vet (g)',
  form_fat_sat: 'waarvan Verzadigd (g)',
  form_carbs: 'Koolhydraten (g)',
  form_carbs_sugars: 'waarvan Suikers (g)',
  form_fiber: 'Vezels (g)',
  form_protein: 'Eiwitten (g)',
  form_salt: 'Zout (g)',
  form_save_btn: 'Opslaan & Voorbeeld →',
  // Settings
  settings_title: 'Instellingen',
  settings_language: 'Taal',
  settings_ai_backend: 'AI Backend',
  settings_claude_key: 'Anthropic API-sleutel',
  settings_claude_key_hint: 'Verkrijgbaar via console.anthropic.com',
  settings_claude_base_url: 'Base URL (optioneel)',
  settings_claude_base_url_hint: 'Leeg laten voor api.anthropic.com',
  settings_ollama_host: 'Ollama Host',
  settings_ollama_model: 'Ollama Model',
  settings_printer: 'Printernaam',
  settings_printer_hint: 'Moet exact overeenkomen met de naam in Windows Printers',
  settings_save_btn: 'Opslaan',
  settings_saved: 'Opgeslagen!',
}
```

### Nav toggle
Right side of nav bar, next to Settings link:
```
[EN] [NL]   ← active lang is bold/underlined
```

---

## Feature 2: AI Backend Switch

### Architecture

```
electron/ai.js      — unified adapter: extractFromImage(imagePath, config) → LabelData|null
electron/claude.js  — unchanged except extractFromImage removed (stays for parseExtractedJson, buildPrompt)
electron/ollama.js  — new: Ollama HTTP extraction
electron/main.js    — ocr:extract reads config, passes full config to ai.extractFromImage()
```

### ai.js adapter

```js
async function extractFromImage(imagePath, config) {
  if (config.aiBackend === 'ollama') {
    return ollamaExtract(imagePath, config)
  }
  return claudeExtract(imagePath, config)  // default
}
```

### Claude (updated)

Accepts optional `baseURL` — passed to Anthropic SDK constructor:
```js
const client = new Anthropic({
  apiKey,
  ...(baseUrl ? { baseURL: baseUrl } : {})
})
```

### Ollama

- POST to `{ollamaHost}/api/chat`
- Body: `{ model, messages: [{ role: 'user', content: [{ type: 'image_url', image_url: { url: 'data:{mediaType};base64,{base64}' } }, { type: 'text', text: buildPrompt() }] }], stream: false }`
- Uses Node.js built-in `https`/`http` (no new dependency) or `node-fetch` if needed
- Response: `response.message.content` → `parseExtractedJson()`
- Error "ECONNREFUSED" → throw `'Ollama not reachable at {host}'`
- Error from Ollama (model not found, etc.) → relay message

### Config additions

```json
{
  "language": "en",
  "aiBackend": "claude",
  "anthropicApiKey": "sk-...",
  "anthropicBaseUrl": "",
  "ollamaHost": "http://localhost:11434",
  "ollamaModel": "llama3.2-vision",
  "printerName": "Brother QL-810W"
}
```

---

## Settings Screen (updated)

Sections shown/hidden based on `aiBackend` selection:

```
App taal / Language        [EN] [NL]
AI Backend                 [Claude] [Ollama]

— Claude (shown if Claude selected) ——
API Key                    [password]  hint: console.anthropic.com
Base URL (optional)        [text]      hint: leave blank for default

— Ollama (shown if Ollama selected) ——
Host                       [http://localhost:11434]
Model                      [llama3.2-vision]

— Printer ——————————————————————
Printer Name               [text]      hint: match Windows name

[Save]   Saved!
```

---

## Files Modified/Created

| File | Change |
|------|--------|
| `src/i18n.js` | New — EN/NL dicts, LanguageContext, useT() |
| `src/App.jsx` | Add LanguageContext provider + load lang from config + EN/NL nav toggle |
| `src/screens/Home.jsx` | Replace hardcoded strings with `t()` calls |
| `src/screens/NewLabel.jsx` | Replace hardcoded strings with `t()` calls |
| `src/screens/Settings.jsx` | Full rewrite — add lang/backend/ollama fields |
| `src/components/LabelForm.jsx` | Replace hardcoded strings with `t()` calls |
| `electron/ai.js` | New — adapter routing to claude or ollama |
| `electron/ollama.js` | New — Ollama HTTP extraction |
| `electron/claude.js` | Remove `extractFromImage`, keep `parseExtractedJson` + `buildPrompt` |
| `electron/main.js` | `ocr:extract` passes full config to `ai.extractFromImage` |

---

## Out of Scope

- More than 2 languages
- Per-field language override
- Ollama streaming responses
- Claude model selection (stays `claude-sonnet-4-6`)
