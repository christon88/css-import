# css-import README

Provides autocomplete for utility classes and CSS variables in node_modules

## Features

Autocomplete for utility classes and CSS variables in node_modules

## Extension Settings

Requires `.cssImport.json` file at root with the following entries

```
{
    "cssUtilityPath": "node_modules/[path to css]",
    "cssVariablesPath": "node_modules/[path to css]"
}

```

## Known Issues

Does not watch `.cssImport.json` so extension needs to be reloaded after changes.

Does only support one file

## Release Notes

### 0.1.0

Mainly for my own use
