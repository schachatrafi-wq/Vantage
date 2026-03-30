import { defineConfig } from '@trigger.dev/sdk/v3'

export default defineConfig({
  project: process.env.TRIGGER_PROJECT_ID ?? 'vantage',
  dirs: ['./src/trigger'],
  maxDuration: 300,
})
