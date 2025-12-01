#!/bin/bash

# =======================================================
#  Clean Project Dumper
#  Собирает только код проекта в один файл
# =======================================================

OUT="project_clean_dump_$(date +%Y-%m-%d_%H-%M-%S).txt"
> "$OUT"

echo "=== package.json ===" >> "$OUT"
sed -n '1,200p' package.json >> "$OUT" 2>/dev/null
echo >> "$OUT"

dump_dir() {
  local DIR="$1"
  if [ -d "$DIR" ]; then
    find "$DIR" -type f \
      \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.json" \) \
      | sort \
      | while read -r FILE; do
          echo -e "\n================ $FILE ================\n" >> "$OUT"
          sed -n '1,400p' "$FILE" >> "$OUT" 2>/dev/null
        done
  fi
}

dump_dir "app"
dump_dir "src"

echo -e "\n✨ Готово! Дамп сохранён в файл: $OUT"
