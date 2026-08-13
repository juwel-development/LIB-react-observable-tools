/** Conventional Commits. semantic-release derives the next version from these messages,
 *  so the type prefix is what decides patch vs minor vs major.
 *
 *  `.mjs` rather than `.js`: this package has no `"type": "module"`, so a bare `.js`
 *  config would be read as CommonJS and the `export default` below would throw. */
export default {
  extends: ['@commitlint/config-conventional'],
};
