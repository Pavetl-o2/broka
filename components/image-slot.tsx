'use client';

import Image from 'next/image';
import { createContext, useContext, type ReactNode } from 'react';

const ManifestContext = createContext<Record<string, string>>({});

export function ImagesProvider({
  manifest,
  children,
}: {
  manifest: Record<string, string>;
  children: ReactNode;
}) {
  return <ManifestContext.Provider value={manifest}>{children}</ManifestContext.Provider>;
}

/**
 * Hueco de imagen. Si existe `public/img/<id>.jpg` lo pinta; si no, deja el
 * marcador con la descripción de la foto que va ahí.
 */
export function ImageSlot({
  id,
  placeholder,
  sizes = '(max-width: 768px) 100vw, 45vw',
  priority = false,
}: {
  id: string;
  placeholder: string;
  sizes?: string;
  priority?: boolean;
}) {
  const manifest = useContext(ManifestContext);
  const src = manifest[id];

  if (!src) {
    return (
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[rgba(127,127,127,0.08)] p-3 text-center">
        <span className="absolute inset-0 border-[1.5px] border-dashed border-current opacity-[0.35]" />
        <span className="max-w-[90%] text-[12px] leading-[1.35] font-medium tracking-[0.01em] opacity-75">
          {placeholder}
        </span>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      <Image
        src={src}
        alt={placeholder}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </div>
  );
}
