// src/i18n.js
import React, { createContext, useContext, useState, useEffect } from 'react'

const EN = {
  nav_labels: 'Labels',
  nav_new: '+ New',
  nav_settings: 'Settings',
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
  new_title: 'New Label',
  new_btn_back: '← Back',
  new_btn_pick: '📷 Choose Image',
  new_btn_picking: 'Extracting…',
  new_tab_edit: 'Edit',
  new_tab_preview: 'Preview',
  new_err_extract: 'Could not extract product data. Fill in fields manually.',
  new_btn_print: '🖨 Print',
  new_btn_edit: '← Edit',
  form_product_name: 'Product name',
  form_ingredients: 'Ingrediënten', // Dutch required on label regardless of UI language
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
  nav_labels: 'Etiketten',
  nav_new: '+ Nieuw',
  nav_settings: 'Instellingen',
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
  new_title: 'Nieuw etiket',
  new_btn_back: '← Terug',
  new_btn_pick: '📷 Afbeelding kiezen',
  new_btn_picking: 'Herkennen…',
  new_tab_edit: 'Bewerken',
  new_tab_preview: 'Voorbeeld',
  new_err_extract: 'Kon geen productgegevens herkennen. Vul de velden handmatig in.',
  new_btn_print: '🖨 Afdrukken',
  new_btn_edit: '← Bewerken',
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

const DICTS = { en: EN, nl: NL }

export const LanguageContext = createContext({
  lang: 'en',
  setLang: () => {},
  t: (key) => EN[key] ?? key,
})

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState('en')

  useEffect(() => {
    window.api.config.get().then((cfg) => {
      if (cfg.language === 'nl' || cfg.language === 'en') setLangState(cfg.language)
    })
  }, [])

  function setLang(l) {
    if (l !== 'en' && l !== 'nl') return
    setLangState(l)
    window.api.config.set('language', l)
  }

  const t = (key) => DICTS[lang][key] ?? key

  return React.createElement(LanguageContext.Provider, { value: { lang, setLang, t } }, children)
}

export function useT() {
  return useContext(LanguageContext)
}
