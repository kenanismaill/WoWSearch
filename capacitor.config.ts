import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wowSearch.app',
  appName: 'WoWSearch',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
