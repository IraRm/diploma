#!/bin/bash

# === НАСТРОЙКИ ===
PROJECT_DIR="$(pwd)"                 # текущая папка проекта
OUT_FILE="project_full_dump.txt"     # файл для вывода

echo "Собираю файлы из: $PROJECT_DIR"
echo "Результат: $OUT_FILE"
echo "" > "$OUT_FILE"

# === ФУНКЦИЯ: Проверка, что файл текстовый ===
is_text_file() {
    file "$1" | grep -q "text"
}

# === ОСНОВНОЙ ПОИСК ===
find "$PROJECT_DIR" \
  -type f \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*project_full_dump.txt" \
  ! -path "*dump_all.sh" \
| while read file; do
    if is_text_file "$file"; then
        echo "================ FILE: $file ================" >> "$OUT_FILE"
        cat "$file" >> "$OUT_FILE"
        echo -e "\n\n" >> "$OUT_FILE"
    else
        echo "================ FILE (binary skipped): $file ================" >> "$OUT_FILE"
        echo "(binary file skipped)" >> "$OUT_FILE"
        echo -e "\n\n" >> "$OUT_FILE"
    fi
done

echo "Готово! Смотри файл: $OUT_FILE"
