import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

// Kept in its own file (no other app imports) so client.ts <-> live.ts don't import each other in a cycle.
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // Set to false if statically generating pages, using ISR or tag-based revalidation
})
