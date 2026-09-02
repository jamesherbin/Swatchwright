import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createAseFile, extractAseColors } from '../ase/converter.js';
import { parseComplex } from '../tokens/parser.js';
import sampleTokens from '../tokens/tokens0.json' with { type: 'json' };
import type { TokenTree } from '../types/types.js';
import './styles.css';

interface PaletteState { fileName: string; tokens: TokenTree }

function App() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [palette, setPalette] = useState<PaletteState | null>(null);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const extracted = palette ? extractAseColors(palette.tokens) : null;

  async function readFile(file: File) {
    setError('');
    if (!file.name.toLowerCase().endsWith('.json')) {
      setError('Choose a JSON design-token file.');
      return;
    }
    try {
      const tokens = parseComplex(await file.text());
      if (extractAseColors(tokens).colors.length === 0) {
        throw new Error('No direct #RRGGBB color tokens were found in this file.');
      }
      setPalette({ fileName: file.name, tokens });
    } catch (cause: unknown) {
      setPalette(null);
      setError(cause instanceof Error ? cause.message : 'The token file could not be read.');
    }
  }

  function loadSample() {
    setError('');
    setPalette({ fileName: 'tokens0.json', tokens: parseComplex(sampleTokens) });
  }

  function downloadAse() {
    if (!palette) return;
    try {
      const bytes = createAseFile(palette.tokens);
      const url = URL.createObjectURL(new Blob([bytes.buffer], { type: 'application/octet-stream' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${palette.fileName.replace(/\.json$/i, '') || 'palette'}.ase`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : 'The ASE file could not be created.');
    }
  }

  return (
    <main>
      <header className="masthead">
        <a className="brand" href="/" aria-label="Swatchwright home">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          Swatchwright
        </a>
        <span className="privacy-note">Local conversion · files never leave your browser</span>
      </header>

      <section className="hero">
        <div className="eyebrow"><span /> Design tokens in, Adobe colors out</div>
        <h1>Build an ASE palette<br />without the busywork.</h1>
        <p className="lede">Drop in W3C-style design-token JSON. Review every direct hex color, then download a ready-to-import Adobe Swatch Exchange file.</p>
      </section>

      <section className="workspace" aria-label="Token converter">
        <div className="input-panel">
          <Step number="01" title="Add token JSON" detail="Nested token sets are supported." />
          <button
            className={`drop-zone ${dragging ? 'is-dragging' : ''}`}
            type="button"
            onClick={() => fileInput.current?.click()}
            onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault(); setDragging(false);
              const file = event.dataTransfer.files[0];
              if (file) void readFile(file);
            }}
          >
            <span className="upload-icon" aria-hidden="true">↑</span>
            <strong>{palette ? palette.fileName : 'Drop a token file here'}</strong>
            <span>{palette ? 'Choose another file' : 'or click to browse · JSON only'}</span>
          </button>
          <input
            ref={fileInput}
            className="visually-hidden"
            type="file"
            accept="application/json,.json"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void readFile(file);
              event.target.value = '';
            }}
          />
          <button className="sample-button" type="button" onClick={loadSample}>Try the included 8-color sample <span aria-hidden="true">→</span></button>
          {error && <p className="error" role="alert">{error}</p>}
        </div>

        <div className="output-panel">
          <Step number="02" title="Review & download" detail="Only direct #RRGGBB colors are included." />
          {extracted && palette ? (
            <>
              <div className="palette-summary">
                <div><strong>{extracted.colors.length}</strong><span>swatches ready</span></div>
                <p>{skipSummary(extracted.referenced, extracted.unsupported)}</p>
              </div>
              <div className="swatch-grid" aria-label="Detected color swatches">
                {extracted.colors.map((color) => {
                  const channels = color.color.map((channel) => Math.round(channel * 255));
                  const hex = `#${channels.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
                  return (
                    <article className="swatch" key={color.name} title={color.name}>
                      <span style={{ backgroundColor: hex }} />
                      <div><strong>{color.name.split('.').at(-1)}</strong><code>{hex}</code></div>
                    </article>
                  );
                })}
              </div>
              <button className="download-button" type="button" onClick={downloadAse}>
                Download {palette.fileName.replace(/\.json$/i, '')}.ase <span aria-hidden="true">↓</span>
              </button>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-swatches" aria-hidden="true"><i /><i /><i /><i /></div>
              <strong>Your palette will appear here</strong>
              <p>Add a valid token file to preview its colors and create an ASE download.</p>
            </div>
          )}
        </div>
      </section>

      <footer><p><span>01</span> Upload JSON</p><b>→</b><p><span>02</span> Check swatches</p><b>→</b><p><span>03</span> Import into Adobe</p></footer>
    </main>
  );
}

function Step({ number, title, detail }: { number: string; title: string; detail: string }) {
  return <div className="step-heading"><span>{number}</span><div><h2>{title}</h2><p>{detail}</p></div></div>;
}

function skipSummary(referenced: number, unsupported: number): string {
  const notes = [];
  if (referenced) notes.push(`${referenced} references skipped`);
  if (unsupported) notes.push(`${unsupported} unsupported values skipped`);
  return notes.join(' · ') || 'All detected colors are ready.';
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
