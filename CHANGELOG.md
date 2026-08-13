# [2.2.0](https://github.com/juwel-development/LIB-react-observable-tools/compare/v2.1.0...v2.2.0) (2026-08-13)


### Bug Fixes

* **ci:** regenerate the lockfile under the npm version CI runs ([8955dd1](https://github.com/juwel-development/LIB-react-observable-tools/commit/8955dd1375ddea19691e88a4c43d6ade2bb4afe1))
* **deps:** regenerate the lockfile incrementally instead of from scratch ([40edd9d](https://github.com/juwel-development/LIB-react-observable-tools/commit/40edd9ddfb13d971579b0f3c24f81a4492c66a46))
* **deps:** remove unused conventional commits dependencies from package-lock ([249006b](https://github.com/juwel-development/LIB-react-observable-tools/commit/249006bbe398865cc64200296fd191402626e497))
* drop the accidentally committed sandcastle worktree gitlink ([2708d4b](https://github.com/juwel-development/LIB-react-observable-tools/commit/2708d4b90fc9195d1904d5f725cbd9be3cc0f428))


### Features

* **build:** split hooks and event bus into separate entry points ([02abd23](https://github.com/juwel-development/LIB-react-observable-tools/commit/02abd235d873d0fd362bb14d308aecdcb2ef6d0e)), closes [#4](https://github.com/juwel-development/LIB-react-observable-tools/issues/4)
* **ci:** publish via npm trusted publishing instead of a token ([ea418e1](https://github.com/juwel-development/LIB-react-observable-tools/commit/ea418e1ef65d3129c6efdc7dffb0b25bec502ff2))
* **operator:** add shareWhileSubscribers ([d069256](https://github.com/juwel-development/LIB-react-observable-tools/commit/d069256cc3f91ba1dea7ad450439db403cb49feb)), closes [#6](https://github.com/juwel-development/LIB-react-observable-tools/issues/6)
* **test:** add Vitest and wire up Sandcastle's local agent substrate ([c4ac693](https://github.com/juwel-development/LIB-react-observable-tools/commit/c4ac6930d1a2abfdd2304f8ef70221169268720c))
* update sandcastle script to build Docker image before execution ([d3504a8](https://github.com/juwel-development/LIB-react-observable-tools/commit/d3504a8316e20aa3ba304f9eedd14931c3b09a7c))

# [2.1.0](https://github.com/juwel-development/LIB-react-observable-tools/compare/v2.0.0...v2.1.0) (2025-06-07)


### Features

* **update:** support for react 19 ([a283a93](https://github.com/juwel-development/LIB-react-observable-tools/commit/a283a939e7327b6b07e0ced2284c69582d30e35e))

# [2.0.0](https://github.com/juwel-development/LIB-react-observable-tools/compare/v1.2.0...v2.0.0) (2024-05-19)


### Features

* **event:** Introduce global event stream ([4e03eed](https://github.com/juwel-development/LIB-react-observable-tools/commit/4e03eed45e1c9df436d00c000740b47b11ce1523))
* Make IEventHandler generic ([addef39](https://github.com/juwel-development/LIB-react-observable-tools/commit/addef3950e152dc4b0ed9ec0fc0599801bf4e279))


### BREAKING CHANGES

* **event:** We are committed for dependency injection in the client. That's why we provide our GlobalEventStream as an injectable. Therefor tsyringe and reflect-metadata is now required as peer dependency.

# [1.2.0](https://github.com/juwel-development/LIB-react-observable-tools/compare/v1.1.1...v1.2.0) (2024-05-18)


### Features

* Add possibility to use stream values when using `useAction` ([7c3ee28](https://github.com/juwel-development/LIB-react-observable-tools/commit/7c3ee28f1176f12460e96feb0969aaa0c6babecc))


### Reverts

* Revert "chore(release): set `package.json` version to 1.1.1 [skip ci]" ([b9f05fe](https://github.com/juwel-development/LIB-react-observable-tools/commit/b9f05fe5d436693a3c098d10f5fd2089b2f8f533))

## [1.1.1](https://github.com/juwel-development/LIB-react-observable-tools/compare/v1.1.0...v1.1.1) (2024-05-18)

### Bug Fixes

* Improve documentation (which should be released to npm) ([9e01915](https://github.com/juwel-development/LIB-react-observable-tools/commit/9e01915ba90e60584566672902bdebe2bc8b97c1))

# [1.1.0](https://github.com/juwel-development/LIB-react-observable-tools/compare/v1.0.0...v1.1.0) (2024-05-16)


### Features

* Hook that renders based on subscriptions ([5a8522f](https://github.com/juwel-development/LIB-react-observable-tools/commit/5a8522ffe30f31ca2f3fb35b87b7933444c1445c))

# 1.0.0 (2024-05-16)

### Features

* Add documentation for useAction ([fbf1ce8](https://github.com/juwel-development/LIB-react-observable-tools/commit/fbf1ce85c3ed1c1d435c93cd473864e2c87e29d3))
