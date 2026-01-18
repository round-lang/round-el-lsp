# Round EL LSP

Heavily documented sample code for https://code.visualstudio.com/api/language-extensions/language-server-extension-guide

## Structure

```
.
├── client // Language Client
│   ├── src
│   │   ├── test // End to End tests for Language Client / Server
│   │   └── extension.ts // Language Client entry point
├── package.json // The extension manifest.
└── server // Language Server
    └── src
        └── server.ts // Language Server entry point
```

## Run

```shell
pnpm install
pnpm install -g vsce
vsce package
```
