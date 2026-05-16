// electron/ai.js
async function extractFromImage(imagePath, config) {
  if (config.aiBackend === 'ollama') {
    const { ollamaExtract } = await import('./ollama.js')
    return ollamaExtract(imagePath, config)
  }
  const { claudeExtract } = await import('./claude.js')
  return claudeExtract(imagePath, config)
}

module.exports = { extractFromImage }
