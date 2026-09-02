import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ============================================================================
// ES MODULE HELPERS
// ============================================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// ============================================================================
// CONFIGURATION
// ============================================================================

const TOKENS_PATH = join(__dirname, '../tokens/opi/OPI_Colors.json');
const OUTPUT_PATH = join(__dirname, '../build/adobe/design-system.ase');

function writeBuffer( buffer : Buffer ) : void {
    // Ensure output directory exists
  const outputDir = dirname(OUTPUT_PATH);
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }
  
  // Write ASE file
  writeFileSync(OUTPUT_PATH, buffer);
}

export default { writeBuffer }