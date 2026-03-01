import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.codinggurus.banquetease',
  appName: 'BanquetEase',
  webDir: 'out',
  server: {
    // Load the live Vercel deployment so all Next.js API routes work natively.
    // Remove or comment out `url` to bundle the static export instead.
    url: 'https://banquetease.vercel.app',
    cleartext: false
  }
};

export default config;
