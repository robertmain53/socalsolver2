#!/bin/bash

# Update all calculator page templates to use CalculatorWrapper

echo "🔄 Updating calculator page templates..."
echo ""

count=0

# Find all calculator page.tsx files
for file in $(find app -type f -name "page.tsx" -path "*/\[slug\]/*"); do
  # Check if file already has CalculatorWrapper
  if grep -q "CalculatorWrapper" "$file"; then
    echo "⏭️  Skipped (already updated): $file"
    continue
  fi

  # Add import after last import statement
  if ! grep -q "import CalculatorWrapper" "$file"; then
    # Find line number of last import
    last_import=$(grep -n "^import" "$file" | tail -1 | cut -d: -f1)
    if [ -n "$last_import" ]; then
      sed -i "${last_import}a import CalculatorWrapper from '@/components/layout/CalculatorWrapper';" "$file"
    fi
  fi

  # Replace calculator div wrapper with CalculatorWrapper
  # Pattern: <div className="lg:col-span-1  bg-white rounded-2xl shadow-lg">
  sed -i 's|<div className="lg:col-span-[0-9]\+\s*bg-white rounded-2xl shadow-lg">|<CalculatorWrapper>|g' "$file"
  sed -i 's|<div className="lg:col-span-[0-9]\+\s\+bg-white rounded-2xl shadow-lg">|<CalculatorWrapper>|g' "$file"

  # Close CalculatorWrapper instead of div after CalculatorComponent
  sed -i '/<CalculatorComponent \/>/,/<\/div>/ {
    /<\/div>/ {
      s|</div>|</CalculatorWrapper>|
      :a
      n
      /<\/div>/! ba
    }
  }' "$file"

  echo "✅ Updated: $file"
  ((count++))
done

echo ""
echo "==================================="
echo "✨ Updated $count page templates"
echo "==================================="
