// scripts/photoshop/load-colors.jsx
#target photoshop

/**
 * Load colors from JSON into Photoshop
 * Note: Photoshop doesn't support ASE import via scripting,
 * so we use JSON and create colors directly
 */
function loadColorsFromJSON(jsonFilePath) {
  var file = new File(jsonFilePath);
  file.open('r');
  var content = file.read();
  file.close();
  
  var tokens = eval('(' + content + ')');
  
  // Create a new color swatch
  function createColor(name, hexValue) {
    var color = new SolidColor();
    color.rgb.hexValue = hexValue.replace('#', '');
    
    // Add to foreground color (example usage)
    app.foregroundColor = color;
    
    // Note: Photoshop scripting has limited swatch management
    // For full swatch support, consider using Actions
  }
  
  // Process tokens recursively
  function processTokens(obj, path) {
    for (var key in obj) {
      if (obj[key].$value && obj[key].$type === 'color') {
        createColor(path + '.' + key, obj[key].$value);
      } else if (typeof obj[key] === 'object') {
        processTokens(obj[key], path ? path + '.' + key : key);
      }
    }
  }
  
  processTokens(tokens, '');
}

// Usage
loadColorsFromJSON("~/design-system/tokens/colors.json");
