#!/bin/sh
set -e
# Create/update tables (safe to run on every start)
npx prisma db push --skip-generate
exec "$@"
