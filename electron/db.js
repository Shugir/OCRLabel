const Database = require('better-sqlite3')
const { join } = require('path')
const os = require('os')
const { existsSync, mkdirSync } = require('fs')

let db

function dbPath() {
  if (process.env.OCRLABEL_DB_PATH) return process.env.OCRLABEL_DB_PATH
  const dir = join(os.homedir(), '.ocrlabel')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  return join(dir, 'labels.db')
}

function initDb() {
  db = new Database(dbPath())
  db.exec(`
    CREATE TABLE IF NOT EXISTS labels (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
      image_path       TEXT,
      product_name     TEXT,
      ingredients      TEXT,
      allergens        TEXT,
      storage_info     TEXT,
      manufacturer     TEXT,
      net_weight       TEXT,
      energy_kj        TEXT,
      energy_kcal      TEXT,
      fat_total        TEXT,
      fat_saturated    TEXT,
      carbs_total      TEXT,
      carbs_sugars     TEXT,
      fiber            TEXT,
      protein          TEXT,
      salt             TEXT,
      printed_at       DATETIME
    )
  `)
  return db
}

function saveLabel(data) {
  const stmt = db.prepare(`
    INSERT INTO labels
      (image_path, product_name, ingredients, allergens, storage_info,
       manufacturer, net_weight, energy_kj, energy_kcal, fat_total,
       fat_saturated, carbs_total, carbs_sugars, fiber, protein, salt)
    VALUES
      (@image_path, @product_name, @ingredients, @allergens, @storage_info,
       @manufacturer, @net_weight, @energy_kj, @energy_kcal, @fat_total,
       @fat_saturated, @carbs_total, @carbs_sugars, @fiber, @protein, @salt)
  `)
  return stmt.run(data).lastInsertRowid
}

function listLabels() {
  return db.prepare('SELECT * FROM labels ORDER BY created_at DESC, id DESC').all()
}

function getLabel(id) {
  return db.prepare('SELECT * FROM labels WHERE id = ?').get(id)
}

function deleteLabel(id) {
  db.prepare('DELETE FROM labels WHERE id = ?').run(id)
}

function markPrinted(id) {
  db.prepare("UPDATE labels SET printed_at = datetime('now') WHERE id = ?").run(id)
}

module.exports = { initDb, saveLabel, listLabels, getLabel, deleteLabel, markPrinted }
