// build.js
import StyleDictionary from 'style-dictionary';
import { createAseFile } from './scripts/aseGenerator.js'; // You'll need to extract this function

// Custom format for ASE generation
StyleDictionary.registerFormat({
  name: 'adobe/ase',
  format: function({ dictionary }) {
    return createAseFile(dictionary.allTokens);
  }
});

// Configuration
const sd = StyleDictionary.extend({
  source: ['tokens/**/*.json'],
  platforms: {
    // Web outputs
    css: {
      transformGroup: 'css',
      buildPath: 'build/css/',
      files: [{
        destination: 'variables.css',
        format: 'css/variables'
      }]
    },
    
    scss: {
      transformGroup: 'scss',
      buildPath: 'build/scss/',
      files: [{
        destination: '_variables.scss',
        format: 'scss/variables'
      }]
    },
    
    // Adobe output
    adobe: {
      transformGroup: 'css', // Use CSS transforms for color conversion
      buildPath: 'build/adobe/',
      files: [{
        destination: 'design-system.ase',
        format: 'adobe/ase'
      }]
    }
  }
});

// Build the design system
sd.buildAllPlatforms();

export default sd;
