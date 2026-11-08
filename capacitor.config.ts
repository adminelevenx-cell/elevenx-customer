import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.elevenxkit.customer',
  appName: 'ElevenX Customer',
  webDir: 'www',
  bundledWebRuntime: false,
  android: { allowMixedContent: false }
};

export default config;
