#!/bin/bash

OUT="project_dump.txt"
echo "" > "$OUT"

add_file() {
  if [ -f "$1" ]; then
    echo -e "\n================ FILE: $1 ================\n" >> "$OUT"
    cat "$1" >> "$OUT"
  fi
}

add_dir() {
  for f in $(find "$1" -type f \
      -not -path "*/node_modules/*" \
      -not -path "*/.expo/*" \
      -not -path "*/.git/*" \
      -not -name "*.png" \
      -not -name "*.jpg" \
      -not -name "*.jpeg" \
      -not -name "*.svg" \
      -not -name "*.gif" \
      -not -name "*.ico" \
      -not -name "*.lock" \
      -not -name "*.bin" \
      ); do
        add_file "$f"
  done
}

echo "=== FRONTEND ===" >> "$OUT"
add_file "package.json"
add_dir "app"
add_dir "src"

echo "=== BACKEND ===" >> "$OUT"
add_dir "backend"

echo -e "\nDONE! All meaningful files saved to: $OUT\n"
