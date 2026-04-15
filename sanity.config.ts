import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './sanity/schemaTypes';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'your-project-id';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

export default defineConfig({
  basePath: '/admin-studio',
  projectId,
  dataset,
  title: 'SEO Expert Blog Studio',
  schema: {
    types: schemaTypes,
  },
  plugins: [
    structureTool(),
  ],
});
