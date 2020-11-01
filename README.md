# linkRename recursively
`Rename or test rename` recursively from a podsFolder all solid server links from `solid.community` to `solid.community.net`

Files are filtered on extension : `.acl`, `.meta`, `.ttl`

Selected files have a content including a `solid.community` string.

Original selected files are backed up to `/bak.solid.community`.

Only links enclosed in `<>` and beginning with `https://` are renamed.

## Usage
From the folder containing `linkRename.js`

```javascript
./linkRename.js <command> [<parameter>] [ext=[<extension>]] [<folder>]

// examples : 
./linkRename.js run ../server/data
./linkRename.js test ext=acl --folder ../server/data
```

- <command\> being : `test`, `run`, `help`

- <extension\> : default all (`acl`, `meta` and `ttl`) , else only one

- <parameter\> (level of reporting) : `--file` (default),  `--folder` or `--no`

## Nota :
The app should be `run` twice. All files containing `solid.community` strings are listed 

Only links may be converted.

On second pass, all remaining files containing `solid.community` and not converted (literal, ...) are listed.
