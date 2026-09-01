{
  name: 'adobe/ase',
  format: function({ dictionary }) {
    return createAseFile(dictionary.allTokens);
  }
}
