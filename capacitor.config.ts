import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.serviceoncall.app',
  appName: 'MyServiceApp',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;