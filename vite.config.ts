import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all envs regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      /**
       * We use JSON.stringify to ensure the strings are injected correctly 
       * into the client-side code during the build/dev process.
       */
      
      // Gemini AI Key
      'process.env.API_KEY': JSON.stringify(
        env.VITE_GOOGLE_API_KEY || 'AIzaSyA1zu5CJMoD68CLK03WeNnL1Hn44GSzFFI'
      ),

      // Supabase Project URL
      'process.env.VITE_SUPABASE_URL': JSON.stringify(
        env.VITE_SUPABASE_URL || 'https://pdrigvhbgwcwunqihrpk.supabase.co'
      ),

      // Supabase Anon Key
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(
        env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkcmlndmhiZ3djd3VucWlocnBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2ODM5MzAsImV4cCI6MjA4MjI1OTkzMH0.J5USRgdl3ElXD2IvHRwGMpgirbtpEH8G1dSutEVz2e8'
      ),
    },
    build: {
      outDir: 'dist',
      sourcemap: true
    },
    server: {
      port: 3000, // Optional: specifies a consistent port
      open: true  // Optional: opens browser on start
    }
  };
});