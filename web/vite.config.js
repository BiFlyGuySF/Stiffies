import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { existsSync } from 'fs'

const base = existsSync('CNAME') ? '/' : '/Stiffies/'

export default defineConfig({
  plugins: [react()],
  base,
})
