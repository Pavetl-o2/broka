import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import { CartDrawer } from '@/components/cart-drawer';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { ImagesProvider } from '@/components/image-slot';
import { imageManifest } from '@/lib/images';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Broka · Mobiliario CNC a la medida',
    template: '%s · Broka',
  },
  description:
    'Broka — mobiliario CNC a la medida. Panel de ingeniería ruteado a 0.1 mm. Configura medida y acabado en 3D.',
  openGraph: {
    title: 'Broka · Mobiliario CNC a la medida',
    description:
      'Diseño paramétrico, corte de control numérico, entrega plana. Fabricado en Guadalajara, México.',
    locale: 'es_MX',
    type: 'website',
    siteName: 'Broka',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX" className={spaceGrotesk.variable}>
      <body className="min-h-screen overflow-x-hidden bg-paper">
        <ImagesProvider manifest={imageManifest()}>
          <div className="border-b border-ink px-5 py-2 text-center text-[9.5px] tracking-[0.2em] uppercase">
            Fabricación bajo pedido · 4 a 6 semanas · Envío nacional incluido desde $10,000 MXN
          </div>
          <Header />
          {children}
          <Footer />
          <CartDrawer />
        </ImagesProvider>
      </body>
    </html>
  );
}
