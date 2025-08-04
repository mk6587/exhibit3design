import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.9274c50ff2b34f9da55e8239e07b0a8a',
  appName: 'exhibit3design',
  webDir: 'dist',
  server: {
    url: 'https://9274c50f-f2b3-4f9d-a55e-8239e07b0a8a.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;