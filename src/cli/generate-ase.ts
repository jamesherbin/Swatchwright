// aseGenerator.js
import { AseColor, AseData, encode } from 'ase-utils';
import { DesignToken, TokenTree} from '../types/types.js';
import writeBuffer from  './ase-writer.js'

// ============================================================================
// MAIN GENERATION FUNCTION
// ============================================================================

export function generateAseFromTokens() {
  console.log('\n🎨 Generating Adobe Swatch Exchange (ASE) file...\n');
  
  // Check if tokens file exists
  if (!existsSync(TOKENS_PATH)) {
    console.error(`❌ Error: Token file not found at ${TOKENS_PATH}`);
    console.error('   Run "npm run build:tokens" first to generate tokens.json\n');
    throw new Error();
  }
  
  // Read tokens
  const tokenData = JSON.parse(readFileSync(TOKENS_PATH, 'utf8'));
  
  const tokenTree : TokenTree = tokenData;
  
  const { colors, groups } = extractColors(tokenTree);
  
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
    writeBuffer( aseBuffer );
  } catch (error) {
    console.error('❌ Error encoding ASE file:', error.message);
    console.error('\n   This may be due to invalid color values.');
    console.error('   Ensure all colors are valid hex codes (e.g., #007bff)\n');
    throw error;
  }
  
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


generateAseFromTokens();
