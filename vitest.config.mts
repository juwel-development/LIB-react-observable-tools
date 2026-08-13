import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: 'jsdom',
    globals: true,
    // Scope discovery to this tree's src. Sandcastle checks each agent out into a
    // git worktree under .sandcastle/worktrees/<branch>/ with its own src/; vitest's
    // default include walks those, so a worktree mid-TDD (spec ahead of code) would
    // fail this tree's pre-commit run. A positive include beats a per-worktree exclude.
    include: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/**/*.spec.ts', 'src/**/*.spec.tsx'],
    },
  },
});
