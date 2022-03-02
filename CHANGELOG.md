# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.7.10](https://github.com/stryker-mutator/mutation-testing-elements/compare/v1.7.9...v1.7.10) (2022-01-28)

**Note:** Version bump only for package root





## [1.7.9](https://github.com/stryker-mutator/mutation-testing-elements/compare/v1.7.8...v1.7.9) (2022-01-28)


### Bug Fixes

* **aggregate:** also make ids unique ([#1673](https://github.com/stryker-mutator/mutation-testing-elements/issues/1673)) ([3fcbbc6](https://github.com/stryker-mutator/mutation-testing-elements/commit/3fcbbc66df6a27282dc8234435bd2f6004302318)), closes [#1672](https://github.com/stryker-mutator/mutation-testing-elements/issues/1672)
* **mutation-testing-elements:** Don't render statusreason if it's an empty string ([#1620](https://github.com/stryker-mutator/mutation-testing-elements/issues/1620)) ([c5e97e2](https://github.com/stryker-mutator/mutation-testing-elements/commit/c5e97e246e88bb249c10c05158480cf3acaccb2b))





## [1.7.8](https://github.com/stryker-mutator/mutation-testing-elements/compare/v1.7.7...v1.7.8) (2021-12-09)

**Note:** Version bump only for package root





## [1.7.7](https://github.com/stryker-mutator/mutation-testing-elements/compare/v1.7.6...v1.7.7) (2021-12-09)


### Performance Improvements

* **metrics:** use Map for fast testId -> TestModel lookup ([dfca0bc](https://github.com/stryker-mutator/mutation-testing-elements/commit/dfca0bcc5033daee9227a9bce1bab2a4da556313))
* **mutation-test-report-app:** only recalculate metrics if report changed ([42b7bc0](https://github.com/stryker-mutator/mutation-testing-elements/commit/42b7bc0b6fad97180aa3775fbc57ff13f222cb32))
* **mutation-test-report-app:** only render once by setting props in earlier hooks ([210da55](https://github.com/stryker-mutator/mutation-testing-elements/commit/210da557d0aea4a3ac7748386413742435111b54))





## [1.7.6](https://github.com/stryker-mutator/mutation-testing-elements/compare/v1.7.5...v1.7.6) (2021-11-19)


### Bug Fixes

* stryker-net url ([#1482](https://github.com/stryker-mutator/mutation-testing-elements/issues/1482)) ([15c46d9](https://github.com/stryker-mutator/mutation-testing-elements/commit/15c46d9c0431695a3c436fc7011f29c747875209))


### Features

* **diff:** add new "diff" feature to mutant view  ([#1515](https://github.com/stryker-mutator/mutation-testing-elements/issues/1515)) ([c5f0657](https://github.com/stryker-mutator/mutation-testing-elements/commit/c5f0657a26be07fa4607a89291d34ceac1110632))





## [1.7.5](https://github.com/stryker-mutator/mutation-testing-elements/compare/v1.7.4...v1.7.5) (2021-08-01)


### Features

* **metrics:** add `aggregateResultsByModule` function ([#1225](https://github.com/stryker-mutator/mutation-testing-elements/issues/1225)) ([bb690b8](https://github.com/stryker-mutator/mutation-testing-elements/commit/bb690b8ce8588a42ab8b0d4967b2b52e2c769b7a))
* **mutant-view:** show status reason in drawer ([#1290](https://github.com/stryker-mutator/mutation-testing-elements/issues/1290)) ([0e6750d](https://github.com/stryker-mutator/mutation-testing-elements/commit/0e6750d845705191e151a8647f752100c52a91dd))





## [1.7.4](https://github.com/stryker-mutator/mutation-testing-elements/compare/v1.7.3...v1.7.4) (2021-07-13)


### Bug Fixes

* **exports:** add default export for the schema ([#1255](https://github.com/stryker-mutator/mutation-testing-elements/issues/1255)) ([d516054](https://github.com/stryker-mutator/mutation-testing-elements/commit/d516054bae9a1d4311be05da02a1d73b6ca2999f))
* package.json from package report-schema ([0233173](https://github.com/stryker-mutator/mutation-testing-elements/commit/02331735992b8498f43a809990b095a655d6fd93))





## [1.7.2](https://github.com/stryker-mutator/mutation-testing-elements/compare/v1.7.1...v1.7.2) (2021-05-03)


### Bug Fixes

* **elements:** add check if localStorage is available ([#1073](https://github.com/stryker-mutator/mutation-testing-elements/issues/1073)) ([9e57c0a](https://github.com/stryker-mutator/mutation-testing-elements/commit/9e57c0abaa0ea49c61c9f592516616b286722def))
* **sonatype:** incorrect project folder for elements and report-schema Sonatype release ([#1072](https://github.com/stryker-mutator/mutation-testing-elements/issues/1072)) ([4b2358d](https://github.com/stryker-mutator/mutation-testing-elements/commit/4b2358d5f43696fc3fd99a8de898f1ea93093b79))





## [1.7.1](https://github.com/stryker-mutator/mutation-testing-elements/compare/v1.7.0...v1.7.1) (2021-05-02)


### Features

* **info:** add tooltip information about states ([#1069](https://github.com/stryker-mutator/mutation-testing-elements/issues/1069)) ([af88c1e](https://github.com/stryker-mutator/mutation-testing-elements/commit/af88c1e355400855ff7001acd81b1c018bfec5ef))
* **test-view:** add test view with test details ([#1014](https://github.com/stryker-mutator/mutation-testing-elements/issues/1014)) ([33bb646](https://github.com/stryker-mutator/mutation-testing-elements/commit/33bb6467d74fd730347fbe715219e79569745222))





# [1.7.0](https://github.com/stryker-mutator/mutation-testing-elements/compare/v1.6.2...v1.7.0) (2021-03-19)


### Features

* **dark-mode:** update dark mode colors ([#947](https://github.com/stryker-mutator/mutation-testing-elements/issues/947)) ([9ee0053](https://github.com/stryker-mutator/mutation-testing-elements/commit/9ee00531eda325bc62bbaf5ace4427e47258e975))


### Reverts

* Revert "test: remove metrics-scala tests" ([85b2732](https://github.com/stryker-mutator/mutation-testing-elements/commit/85b2732c920a265ccf2e9b570db422bdb8ba35e4))
* Revert "Use setup-scala" ([db9a528](https://github.com/stryker-mutator/mutation-testing-elements/commit/db9a528c7c0ac58e22c874b4593e0b77c2f1f4e7))





## [1.6.2](https://github.com/stryker-mutator/mutation-testing-elements/compare/v1.6.1...v1.6.2) (2021-02-24)


### Features

* **file:** add methods to retrieve source content ([#928](https://github.com/stryker-mutator/mutation-testing-elements/issues/928)) ([0d3d851](https://github.com/stryker-mutator/mutation-testing-elements/commit/0d3d8518e546040c7f62b10b033a283f08d435b4))





## [1.6.1](https://github.com/stryker-mutator/mutation-testing-elements/compare/v1.6.0...v1.6.1) (2021-02-23)


### Bug Fixes

* **mutant-model:** add missing `statusReason` field ([#916](https://github.com/stryker-mutator/mutation-testing-elements/issues/916)) ([80ffbec](https://github.com/stryker-mutator/mutation-testing-elements/commit/80ffbec023e860a7b64f8bd5dbf849ac2d5b76d2))





# [1.6.0](https://github.com/stryker-mutator/mutation-testing-elements/compare/v1.5.2...v1.6.0) (2021-02-22)


### Features

* **metrics:** add test metrics ([#871](https://github.com/stryker-mutator/mutation-testing-elements/issues/871)) ([4758f39](https://github.com/stryker-mutator/mutation-testing-elements/commit/4758f39a3b08a9fd5828d6491d4d559ac38308d6))
* **metrics-scala:** add config to MutationTestResult ([#911](https://github.com/stryker-mutator/mutation-testing-elements/issues/911)) ([0497733](https://github.com/stryker-mutator/mutation-testing-elements/commit/0497733a2501bbe817d765a82a695d7650bb78e4))
* **schema:** add test file source and status reason ([#893](https://github.com/stryker-mutator/mutation-testing-elements/issues/893)) ([9666408](https://github.com/stryker-mutator/mutation-testing-elements/commit/96664081945c0903816623afdf73fbe9cb517591)), closes [#891](https://github.com/stryker-mutator/mutation-testing-elements/issues/891) [#892](https://github.com/stryker-mutator/mutation-testing-elements/issues/892)





## [1.5.1](https://github.com/stryker-mutator/mutation-testing-elements/compare/v1.5.0...v1.5.1) (2020-12-23)


### Bug Fixes

* **metrics-scala:** publish project in a single go ([932d05f](https://github.com/stryker-mutator/mutation-testing-elements/commit/932d05ff79dd570f986085bf4b30351f1478ccd9))





# [1.5.0](https://github.com/stryker-mutator/mutation-testing-elements/compare/v1.4.4...v1.5.0) (2020-12-23)


### Bug Fixes

* **build:** fix release process ([4ef6e18](https://github.com/stryker-mutator/mutation-testing-elements/commit/4ef6e189b8880845ecd88da2bdcc41e86cace0ef))
* **report-schema:** replace no-break space with normal space ([#815](https://github.com/stryker-mutator/mutation-testing-elements/issues/815)) ([5e7e6bc](https://github.com/stryker-mutator/mutation-testing-elements/commit/5e7e6bc66538d06393f5d8f9705fe34c9d6d6ad1))
* **schema:** correctly use "title" and "description" ([#804](https://github.com/stryker-mutator/mutation-testing-elements/issues/804)) ([1834510](https://github.com/stryker-mutator/mutation-testing-elements/commit/1834510c6b6e880540a8eab0a5eb0e1efdebfae9))


### Features

* **metrics-scala:** add support for test coverage and metadata ([#816](https://github.com/stryker-mutator/mutation-testing-elements/issues/816)) ([580f34a](https://github.com/stryker-mutator/mutation-testing-elements/commit/580f34abc1d9e01f055be8b42bc4fb6ee4d3cf3c))
* **metrics-scala:** align naming of types with schema ([#810](https://github.com/stryker-mutator/mutation-testing-elements/issues/810)) ([f47af3e](https://github.com/stryker-mutator/mutation-testing-elements/commit/f47af3eb28beae9d4792c9360d40f1149d9e456f))
* **report-schema:** generate TS types from schema ([#811](https://github.com/stryker-mutator/mutation-testing-elements/issues/811)) ([3aa4a95](https://github.com/stryker-mutator/mutation-testing-elements/commit/3aa4a95c3d59a0d74594e49dfdf62d862f861d3d))
* **schema:** add config, test coverage and metadata ([#805](https://github.com/stryker-mutator/mutation-testing-elements/issues/805)) ([df34b68](https://github.com/stryker-mutator/mutation-testing-elements/commit/df34b6873d62c3c6e325f64c2135bb001cdfed1a))


### BREAKING CHANGES

* **metrics-scala:** MutationTestReport was renamed to MutationTestResult
* **metrics-scala:** MutationTestResult was renamed to FileResult





## [1.4.4](https://github.com/stryker-mutator/mutation-testing-elements/compare/v1.4.3...v1.4.4) (2020-11-04)


### Bug Fixes

* **metrics-scala:** drop null-values from circe json ([0293141](https://github.com/stryker-mutator/mutation-testing-elements/commit/0293141ffa013763a8fca52b9be175eba149f7e7))





## [1.4.3](https://github.com/stryker-mutator/mutation-testing-elements/compare/v1.4.2...v1.4.3) (2020-11-04)


### Bug Fixes

* **ts:** make project root optional in TS api ([#721](https://github.com/stryker-mutator/mutation-testing-elements/issues/721)) ([c066733](https://github.com/stryker-mutator/mutation-testing-elements/commit/c06673391ee3c58ddfc2d074d3653755ef641c0a))





## [1.4.2](https://github.com/stryker-mutator/mutation-testing-elements/compare/v1.4.1...v1.4.2) (2020-11-03)


### Bug Fixes

* **metrics-scala:** release process if versions in submodules differ ([525f791](https://github.com/stryker-mutator/mutation-testing-elements/commit/525f791d507899df2dc843704cb0ac398a47982c))
* **sonatype:** give elements and report-schema their own sonatype version ([ec93ce3](https://github.com/stryker-mutator/mutation-testing-elements/commit/ec93ce3861fcb46e052626fa59c0db5597487345))





## [1.4.1](https://github.com/stryker-mutator/mutation-testing-elements/compare/v1.4.0...v1.4.1) (2020-10-27)


### Reverts

* Revert "Apply formatting for new prettier version" ([30ab981](https://github.com/stryker-mutator/mutation-testing-elements/commit/30ab981e0a01eb553b28ec1eff6a5947499b5afb))





# [1.4.0](https://github.com/stryker-mutator/mutation-testing-elements/compare/v1.3.1...v1.4.0) (2020-08-25)


### Bug Fixes

* **elements:** fix stryker config in elements ([#592](https://github.com/stryker-mutator/mutation-testing-elements/issues/592)) ([01d5c9a](https://github.com/stryker-mutator/mutation-testing-elements/commit/01d5c9adfcc95e5b87dab1aa65df599746029e18))
* **sonatype:** fix release process for sonatype ([a308a85](https://github.com/stryker-mutator/mutation-testing-elements/commit/a308a8512c2f2539f98ef16d65a01289b8d0ba1f))


### Features

* **metrics-scala:** add optional description field ([#602](https://github.com/stryker-mutator/mutation-testing-elements/issues/602)) ([2ef280c](https://github.com/stryker-mutator/mutation-testing-elements/commit/2ef280c8cffaa1e97001cd6d6d74e12630846604))
* **metrics-scala:** add support for RuntimeError mutant status ([#609](https://github.com/stryker-mutator/mutation-testing-elements/issues/609)) ([d4c9ae5](https://github.com/stryker-mutator/mutation-testing-elements/commit/d4c9ae560753e4841b9ab03f1fe1cdaddd3b1894))





## [1.3.1](https://github.com/stryker-mutator/mutation-testing-elements/compare/v1.3.0...v1.3.1) (2020-03-28)


### Features

* **elements:** support syntax highlighting for php ([#394](https://github.com/stryker-mutator/mutation-testing-elements/issues/394)) ([0cc5af4](https://github.com/stryker-mutator/mutation-testing-elements/commit/0cc5af48a4ca9c0533d19ccb7a3f27e35b8718b5)), closes [#393](https://github.com/stryker-mutator/mutation-testing-elements/issues/393)
* **sbt:** use sbt for npm projects publishing ([#356](https://github.com/stryker-mutator/mutation-testing-elements/issues/356)) ([6970350](https://github.com/stryker-mutator/mutation-testing-elements/commit/6970350e1537813355bed1c2ea50d23c46f22be5))






# [1.3.0](https://github.com/stryker-mutator/mutation-testing-elements/compare/v1.2.3...v1.3.0) (2020-02-27)


### Bug Fixes

* **metrics-scala:** score should be NaN when there are 0 mutants ([#303](https://github.com/stryker-mutator/mutation-testing-elements/issues/303)) ([b3627e4](https://github.com/stryker-mutator/mutation-testing-elements/commit/b3627e427b8e0eb4bb13f7c5c6a6ee29caa99e44))
* font styling being excluded by postcss ([#311](https://github.com/stryker-mutator/mutation-testing-elements/issues/311)) ([5e53bd1](https://github.com/stryker-mutator/mutation-testing-elements/commit/5e53bd11395f933c334f5a952db131645887c13a))


### Features

* **icons:** add icons to a few file types ([#173](https://github.com/stryker-mutator/mutation-testing-elements/issues/173)) ([a8752b8](https://github.com/stryker-mutator/mutation-testing-elements/commit/a8752b86ab956e4d96bd680e0c221c429174ea06))
* **ignored status:** add MutantStatus Ignored ([#239](https://github.com/stryker-mutator/mutation-testing-elements/issues/239)) ([68b2302](https://github.com/stryker-mutator/mutation-testing-elements/commit/68b23022d2c4d21d642edc17ef4905c77adffd35)), closes [#85](https://github.com/stryker-mutator/mutation-testing-elements/issues/85)
* **line-numbers:** add line numbers in code samples ([#313](https://github.com/stryker-mutator/mutation-testing-elements/issues/313)) ([20b3eab](https://github.com/stryker-mutator/mutation-testing-elements/commit/20b3eabfb89e9791d7425531736a17964f35d93e))
* **n/a mutation score:** support no mutation score ([66a1549](https://github.com/stryker-mutator/mutation-testing-elements/commit/66a1549d7a464ccb42bdd988fa66a20e44430e43))





## [1.2.3](https://github.com/stryker-mutator/mutation-testing-elements/compare/v1.2.2...v1.2.3) (2019-12-11)

**Note:** Version bump only for package root





## [1.2.2](https://github.com/stryker-mutator/mutation-testing-elements/compare/v1.2.1...v1.2.2) (2019-12-04)


### Bug Fixes

* **metrics:** correct lodash import ([3c5d6d2](https://github.com/stryker-mutator/mutation-testing-elements/commit/3c5d6d28e33453801e1b137330f38b616e1910c7))





## [1.2.1](https://github.com/stryker-mutator/mutation-testing-elements/compare/v1.2.0...v1.2.1) (2019-11-24)


### Features

* **elements:** allow override of top offset ([#214](https://github.com/stryker-mutator/mutation-testing-elements/issues/214)) ([b6c5c36](https://github.com/stryker-mutator/mutation-testing-elements/commit/b6c5c3605c2d761c8f31d4eebd069cfc3b4e5ed9))
* **metrics:** make `normalizeFileNames` public ([3017700](https://github.com/stryker-mutator/mutation-testing-elements/commit/3017700a5fb47a73c91e3fd9c9b849fbb49d3520))






# [1.2.0](https://github.com/stryker-mutator/mutation-testing-elements/compare/v1.1.1...v1.2.0) (2019-10-02)


### Features

* add mutation-testing-metrics for Scala ([#65](https://github.com/stryker-mutator/mutation-testing-elements/issues/65)) ([6e732ad](https://github.com/stryker-mutator/mutation-testing-elements/commit/6e732ad))
* **build:** use postcss to optimize css assets ([8f24f06](https://github.com/stryker-mutator/mutation-testing-elements/commit/8f24f06))





## [1.1.1](https://github.com/stryker-mutator/mutation-testing-elements/compare/v1.1.0...v1.1.1) (2019-07-15)


### Bug Fixes

* **legend:** status alignments ([#45](https://github.com/stryker-mutator/mutation-testing-elements/issues/45)) ([5656efd](https://github.com/stryker-mutator/mutation-testing-elements/commit/5656efd))
* **links:** use absolute urls inside the report ([#56](https://github.com/stryker-mutator/mutation-testing-elements/issues/56)) ([1fa4d2f](https://github.com/stryker-mutator/mutation-testing-elements/commit/1fa4d2f))
* **popup:** caution popup arrow color ([#46](https://github.com/stryker-mutator/mutation-testing-elements/issues/46)) ([d44bd4b](https://github.com/stryker-mutator/mutation-testing-elements/commit/d44bd4b))
* **popup:** popup offset ([#47](https://github.com/stryker-mutator/mutation-testing-elements/issues/47)) ([7860fc0](https://github.com/stryker-mutator/mutation-testing-elements/commit/7860fc0))
* **router:** allow url encoded chars in file names ([#55](https://github.com/stryker-mutator/mutation-testing-elements/issues/55)) ([1d73afd](https://github.com/stryker-mutator/mutation-testing-elements/commit/1d73afd))







## [1.1.0](https://github.com/stryker-mutator/mutation-testing-elements/compare/v1.0.7...v1.1.0) (2019-06-17)


### Features

* **color:** add new color for state no-coverage ([1fec8c4](https://github.com/stryker-mutator/mutation-testing-elements/commit/1fec8c4))
* **emoj:** add mutant emoijs ([419da6d](https://github.com/stryker-mutator/mutation-testing-elements/commit/419da6d))
* **mutant description:** show optional mutant description ([#37](https://github.com/stryker-mutator/mutation-testing-elements/issues/37)) ([1f10847](https://github.com/stryker-mutator/mutation-testing-elements/commit/1f10847))






## [1.0.7](https://github.com/stryker-mutator/mutation-testing-elements/compare/v1.0.6...v1.0.7) (2019-04-18)


### Features

* **TypeScript:** publish type information ([#32](https://github.com/stryker-mutator/mutation-testing-elements/issues/32)) ([6a41f7e](https://github.com/stryker-mutator/mutation-testing-elements/commit/6a41f7e))






## [1.0.6](https://github.com/stryker-mutator/mutation-testing-elements/compare/v1.0.5...v1.0.6) (2019-04-09)


### Features

* **metrics:** move metrics to it's own package ([#28](https://github.com/stryker-mutator/mutation-testing-elements/issues/28)) ([fc66b8b](https://github.com/stryker-mutator/mutation-testing-elements/commit/fc66b8b))






## [1.0.5](https://github.com/stryker-mutator/mutation-testing-elements/compare/v1.0.4...v1.0.5) (2019-04-05)


### Bug Fixes

* **schema:** fix resources dir for maven plugin ([ea130e9](https://github.com/stryker-mutator/mutation-testing-elements/commit/ea130e9))





## [1.0.4](https://github.com/stryker-mutator/mutation-testing-elements/compare/v1.0.3...v1.0.4) (2019-04-05)

**Note:** Version bump only for package root





## [1.0.3](https://github.com/stryker-mutator/mutation-testing-elements/compare/v1.0.2...v1.0.3) (2019-04-05)


### Bug Fixes

* **schema:** refer to position with name instead of id ([6fe7d0e](https://github.com/stryker-mutator/mutation-testing-elements/commit/6fe7d0e))


### Features

* **muted title:** create a muted title ([ee1fa8e](https://github.com/stryker-mutator/mutation-testing-elements/commit/ee1fa8e))
* **popup:** color the arrow ([b13898a](https://github.com/stryker-mutator/mutation-testing-elements/commit/b13898a))
* **popup:** make popup visible at bottom of the screen ([#24](https://github.com/stryker-mutator/mutation-testing-elements/issues/24)) ([9606f03](https://github.com/stryker-mutator/mutation-testing-elements/commit/9606f03))
* **popup:** vertical align popup text in middle ([849a366](https://github.com/stryker-mutator/mutation-testing-elements/commit/849a366))
* **sonatype:** Add Sonatype release ([#21](https://github.com/stryker-mutator/mutation-testing-elements/issues/21)) ([f5447d6](https://github.com/stryker-mutator/mutation-testing-elements/commit/f5447d6))
* **table headers:** don't overlap breadcrumb ([fa9d638](https://github.com/stryker-mutator/mutation-testing-elements/commit/fa9d638))





## [1.0.2](https://github.com/stryker-mutator/mutation-testing-elements/compare/v1.0.1...v1.0.2) (2019-03-26)


### Features

* **mutant popup:** add popup for selected mutant ([#17](https://github.com/stryker-mutator/mutation-testing-elements/issues/17)) ([0597327](https://github.com/stryker-mutator/mutation-testing-elements/commit/0597327))





## [1.0.1](https://github.com/stryker-mutator/mutation-testing-elements/compare/v1.0.0...v1.0.1) (2019-03-15)


### Bug Fixes

* **dist:** restructure `dist` folder ([fdcb363](https://github.com/stryker-mutator/mutation-testing-elements/commit/fdcb363))





# [1.0.0](https://github.com/stryker-mutator/mutation-testing-elements/compare/v0.0.7...v1.0.0) (2019-03-13)


### Bug Fixes

* **schema:** validate position `end` object ([a99be0f](https://github.com/stryker-mutator/mutation-testing-elements/commit/a99be0f))


### Features

* **schema:** allow additional properties and validate schema version ([a405212](https://github.com/stryker-mutator/mutation-testing-elements/commit/a405212))
