#!/bin/bash
OUT="project_dump.txt"
echo "==== package.json ====" > "$OUT"
sed -n '1,120p' package.json >> "$OUT" 2>/dev/null

echo -e "\n==== app/_layout.tsx ====" >> "$OUT"
sed -n '1,120p' app/_layout.tsx >> "$OUT" 2>/dev/null

echo -e "\n==== app/index.tsx ====" >> "$OUT"
sed -n '1,120p' app/index.tsx >> "$OUT" 2>/dev/null

echo -e "\n==== app/splash.tsx ====" >> "$OUT"
sed -n '1,120p' app/splash.tsx >> "$OUT" 2>/dev/null

echo -e "\n==== src/theme/colors.ts ====" >> "$OUT"
sed -n '1,120p' src/theme/colors.ts >> "$OUT" 2>/dev/null

echo -e "\n==== app.json ====" >> "$OUT"
sed -n '1,120p' app.json >> "$OUT" 2>/dev/null

echo -e "\nСодержимое сохранено в файл: $OUT"
