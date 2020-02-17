#!/bin/bash

SRC=./dist/index.html
TMP=$SRC.tmp

npm run build && {
  [ -f "$TMP" ] && rm -f "$TMP"
  cp -a "$SRC" "$TMP" && {
     cat "$TMP" | sed 's/href=\//href=\.\//g' | sed 's/src=\//src=\.\//g' > "$SRC"
  }
} && {
  [ -f "$TMP" ] && rm -f "$TMP"
} && {
  [ -d ./dist ] && mv -v ./dist ./docs
}
