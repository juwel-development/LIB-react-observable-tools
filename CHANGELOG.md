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
