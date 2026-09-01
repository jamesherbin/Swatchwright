// build.js
import StyleDictionary from 'style-dictionary';
import aseFormat  from './ase_format.ts';
import styleDictionaryConfig from './config.ts';

// Custom format for ASE generation
StyleDictionary.registerFormat( aseFormat );

// Configuration
const sd = await new StyleDictionary().extend( styleDictionaryConfig );

// Build the design system
sd.buildAllPlatforms();

export default sd;
