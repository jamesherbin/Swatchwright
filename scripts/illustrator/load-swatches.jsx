// scripts/illustrator/load-swatches.jsx
#target illustrator

/**
 * Load ASE file and import swatches into active document
 */
function loadSwatchesFromASE(aseFilePath) {
  var doc = app.activeDocument;
  
  // Open ASE file as temporary document
  var swatchDoc = app.open(new File(aseFilePath));
  var sourceSwatches = swatchDoc.swatches;
  
  // Copy swatches to active document
  for (var i = 0; i < sourceSwatches.length; i++) {
    var swatch = sourceSwatches[i];
    
    // Skip default swatches
    if (swatch.name === "[Registration]" || swatch.name === "[None]") {
      continue;
    }
    
    // Check if swatch already exists
    try {
      var existing = doc.swatches.getByName(swatch.name);
      existing.remove();
    } catch(e) {}
    
    // Add new swatch
    var newSwatch;
    if (swatch.color.typename === "SpotColor") {
      newSwatch = doc.spots.add();
      newSwatch.color = swatch.color.spot.color;
      newSwatch.colorType = ColorModel.SPOT;
    } else {
      newSwatch = doc.swatches.add();
      newSwatch.color = swatch.color;
    }
    
    newSwatch.name = swatch.name;
  }
  
  swatchDoc.close(SaveOptions.DONOTSAVECHANGES);
  alert("Swatches imported successfully!");
}

// Usage
var aseFile = "~/design-system/build/adobe/design-system.ase";
loadSwatchesFromASE(aseFile);
