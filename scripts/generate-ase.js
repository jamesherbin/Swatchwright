// aseGenerator.js
import { encode } from 'ase-utils';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

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

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert hex color to RGB float array (0-1 range)
 * ASE requires RGB values as floats between 0 and 1
 */
function hexToRgbFloat(hex) {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse hex values
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  
  return [r, g, b];
}

/**
 * Recursively extract color tokens from nested object
 * Flattens the token structure and collects all colors
 */
function extractColors(obj, path = [], colors = [], groups = {}) {
  Object.entries(obj).forEach(([key, value]) => {
    const currentPath = [...path, key];
    
    // Check if this is a token (has a value property)
    if (value && typeof value === 'object' && '$value' in value) {
      // Only process color tokens
      if (value.$type === 'color' || (typeof value.value === 'string' && value.value.match(/^#[0-9a-fA-F]{6}$/))) {
        const colorValue = value.$value;
        
        // Skip if it's a reference (starts with {)
        if (colorValue.startsWith('{')) {
          return;
        }
        
        const rgb = hexToRgbFloat(colorValue);
        
        // Get category for grouping (e.g., "brand", "semantic", "neutral")
        const category = path[1] || 'default';
        
        const colorData = {
          name: currentPath.join('.'),
          model: 'RGB',
          color: rgb,
          type: 'global' // Use 'global' so colors update everywhere when changed
        };
        
        colors.push(colorData);
        
        // Group colors by category
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(colorData);
      }
    } else if (value && typeof value === 'object') {
      // Recurse into nested objects
      extractColors(value, currentPath, colors, groups);
    }
  });
  
  return { colors, groups };
}

// ============================================================================
// MAIN GENERATION FUNCTION
// ============================================================================

export function generateAseFromTokens() {
  console.log('\n🎨 Generating Adobe Swatch Exchange (ASE) file...\n');
  
  // Check if tokens file exists
  if (!existsSync(TOKENS_PATH)) {
    console.error(`❌ Error: Token file not found at ${TOKENS_PATH}`);
    console.error('   Run "npm run build:tokens" first to generate tokens.json\n');
    process.exit(1);
  }
  
  // Read tokens
  const tokenData = JSON.parse(readFileSync(TOKENS_PATH, 'utf8'));
  
  // Extract and organize colors
  const { colors, groups } = extractColors(tokenData);
  
  if (colors.length === 0) {
    console.error('❌ Error: No color tokens found in tokens.json\n');
    process.exit(1);
  }
  
  console.log(`   Found ${colors.length} color tokens`);
  console.log(`   Organized into ${Object.keys(groups).length} groups\n`);
  
  // Create ASE data structure using ase-utils format
  // Same format as adobe-swatch-exchange
  const aseData = {
    version: '1.0',
    groups: [], // ase-utils doesn't support groups in encode
    colors: colors
  };
  
  // Encode to ASE binary format
  let aseBuffer;
  try {
    aseBuffer = encode(aseData);
  } catch (error) {
    console.error('❌ Error encoding ASE file:', error.message);
    console.error('\n   This may be due to invalid color values.');
    console.error('   Ensure all colors are valid hex codes (e.g., #007bff)\n');
    process.exit(1);
  }
  
  // Ensure output directory exists
  const outputDir = dirname(OUTPUT_PATH);
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }
  
  // Write ASE file
  writeFileSync(OUTPUT_PATH, aseBuffer);
  
  console.log('✅ Successfully generated ASE file:');
  console.log(`   ${OUTPUT_PATH}\n`);
  console.log('📦 Import into Adobe apps:');
  console.log('   Illustrator: Window → Swatch Libraries → Other Library');
  console.log('   Photoshop: Window → Swatches → Load Swatches');
  console.log('   InDesign: Window → Color → Swatches → Load Swatches\n');
  
  // Display color groups
  console.log('📊 Color categories:');
  Object.entries(groups).forEach(([groupName, groupColors]) => {
    console.log(`   ${groupName}: ${groupColors.length} colors`);
  });
  console.log('');
}

// Export additional utility functions if needed elsewhere
export { hexToRgbFloat, extractColors };

// ============================================================================
// RUN (if executed directly)
// ============================================================================

// Check if this module is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    generateAseFromTokens();
  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}
