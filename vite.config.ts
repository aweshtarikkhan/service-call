
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'process';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      // User's provided Gemini API Key
      'process.env.API_KEY': JSON.stringify(env.VITE_GOOGLE_API_KEY || env.API_KEY || 'AIzaSyA1zu5CJMoD68CLK03WeNnL1Hn44GSzFFI'),
      // User's provided Supabase Project URL (derived from project ID pdrigvhbgwcwunqihrpk)
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || 'https://pdrigvhbgwcwunqihrpk.supabase.co'),
      // User's provided Supabase Anon Key
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkcmlndmhiZ3djd3VucWlocnBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2ODM5MzAsImV4cCI6MjA4MjI1OTkzMH0.J5USRgdl3ElXD2IvHRwGMpgirbtpEH8G1dSutEVz2e8'),
    },
    build: {
      outDir: 'dist',
      sourcemap: true
    }
  };
});
