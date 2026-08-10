import fs from 'node:fs';
import path from 'node:path';

const EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];

/**
 * Qué huecos de imagen ya tienen foto. Se lee una vez, al construir el sitio:
 * sueltas los archivos en `public/img/<id>.jpg` y vuelves a desplegar.
 * Los ids están documentados en README.md.
 *
 * Solo servidor.
 */
export function imageManifest(): Record<string, string> {
  const dir = path.join(process.cwd(), 'public', 'img');
  let files: string[];
  try {
    files = fs.readdirSync(dir);
  } catch {
    return {};
  }

  const out: Record<string, string> = {};
  for (const f of files) {
    const ext = path.extname(f).toLowerCase();
    if (!EXTS.includes(ext)) continue;
    out[path.basename(f, ext)] = `/img/${f}`;
  }
  return out;
}
