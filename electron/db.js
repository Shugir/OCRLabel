const { join } = require('path')
const os = require('os')
const { existsSync, mkdirSync } = require('fs')

let db
let usingSqlite3 = false
let memoryDb = null

// Lazy-load better-sqlite3 only when needed
function getDatabase() {
  try {
    return require('better-sqlite3')
  } catch (e) {
    return null
  }
}

function dbPath() {
  if (process.env.OCRLABEL_DB_PATH) return process.env.OCRLABEL_DB_PATH
  const dir = join(os.homedir(), '.ocrlabel')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  return join(dir, 'labels.db')
}

function initDb() {
  const Database = getDatabase()

  if (Database && process.env.OCRLABEL_DB_PATH !== ':memory:') {
    // Use better-sqlite3 for real database files
    usingSqlite3 = true
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
  } else {
    // Use in-memory implementation for testing
    usingSqlite3 = false
    memoryDb = {
      id: 0,
      labels: []
    }
    db = memoryDb
  }
  return db
}

function saveLabel(data) {
  if (usingSqlite3) {
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
  } else {
    // In-memory implementation
    memoryDb.id++
    const label = {
      id: memoryDb.id,
      created_at: new Date().toISOString(),
      ...data,
      printed_at: null
    }
    memoryDb.labels.push(label)
    return label.id
  }
}

function listLabels() {
  if (usingSqlite3) {
    return db.prepare('SELECT * FROM labels ORDER BY created_at DESC').all()
  } else {
    // In-memory implementation - sort by created_at DESC, then by id DESC as tiebreaker
    return memoryDb.labels.slice().sort((a, b) => {
      const timeA = new Date(b.created_at).getTime()
      const timeB = new Date(a.created_at).getTime()
      if (timeA !== timeB) return timeA - timeB
      return b.id - a.id
    })
  }
}

function getLabel(id) {
  if (usingSqlite3) {
    return db.prepare('SELECT * FROM labels WHERE id = ?').get(id)
  } else {
    // In-memory implementation
    return memoryDb.labels.find(l => l.id === id)
  }
}

function deleteLabel(id) {
  if (usingSqlite3) {
    db.prepare('DELETE FROM labels WHERE id = ?').run(id)
  } else {
    // In-memory implementation
    const idx = memoryDb.labels.findIndex(l => l.id === id)
    if (idx !== -1) {
      memoryDb.labels.splice(idx, 1)
    }
  }
}

function markPrinted(id) {
  if (usingSqlite3) {
    db.prepare("UPDATE labels SET printed_at = datetime('now') WHERE id = ?").run(id)
  } else {
    // In-memory implementation
    const label = memoryDb.labels.find(l => l.id === id)
    if (label) {
      label.printed_at = new Date().toISOString()
    }
  }
}

module.exports = { initDb, saveLabel, listLabels, getLabel, deleteLabel, markPrinted }
