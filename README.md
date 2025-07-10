# mpeg-sdl-editor

[![version](https://img.shields.io/github/v/release/mpeggroup/mpeg-sdl-editor?sort=semver)](https://github.com/mpeggroup/mpeg-sdl-editor/releases)
[![build](https://img.shields.io/github/actions/workflow/status/mpeggroup/mpeg-sdl-editor/release-bun-webapp.yml)](https://github.com/mpeggroup/mpeg-sdl-editor/actions/workflows/release-bun-webapp.yml)
[![license: MIT](https://img.shields.io/github/license/mpeggroup/mpeg-sdl-editor)](https://github.com/mpeggroup/mpeg-sdl-editor/blob/main/LICENSE)

> ISO/IEC 14496-34 Syntactic Description Language (MPEG SDL) web based editor.

## Hosted Instance

Go to: https://mpeggroup.github.io/mpeg-sdl-editor/

## Development

Install dependencies:

`bun install`

Test:

`bun test`

Serve dev version:

`bun html/index.html`

Bundle:

`bun run build`

**NOTE**: The following tasks use Deno as it excels at these and Bun does not
currently provide such functionality:

Format:

`deno fmt`

Lint:

`deno lint src/ tests/`

## Functional Tests

Refer to [functional_tests/README.md](functional_tests/README.md)

## License

MIT © Flowscripter
