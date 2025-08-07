#!/bin/bash

# File Verification Script for Article Enhancement Project

echo "=== Article Enhancement File Verification ==="
echo "Date: $(date)"
echo

# Count all HTML files
echo "📁 File Counts:"
TOTAL_HTML=$(find . -name "*.html" -not -path "./node_modules/*" -not -path "./apps/*" | wc -l)
BACKEND_HTML=$(find backend/data -name "*.html" | wc -l)
BACKUP_HTML=$(find backups -name "*.html" 2>/dev/null | wc -l)

echo "Total HTML files: $TOTAL_HTML"
echo "Backend data files: $BACKEND_HTML"  
echo "Backup files: $BACKUP_HTML"
echo

# Check enhanced articles
echo "✅ Enhanced Articles Status:"
ENHANCED_COUNT=0
ENHANCED_FILES=(
    "signs-a-man-lacks-ambition.html"
    "signs-a-man-is-using-you-for-money.html"
    "signs-a-man-is-serious-about-you.html"
    "signs-a-leo-man-misses-you.html"
    "signs-a-guy-wants-to-hold-your-hand.html"
)

for file in "${ENHANCED_FILES[@]}"; do
    if [ -f "backend/data/$file" ]; then
        SIZE=$(wc -c < "backend/data/$file")
        if [ $SIZE -gt 1000 ]; then
            echo "✅ $file - Enhanced (${SIZE} bytes)"
            ((ENHANCED_COUNT++))
        else
            echo "❌ $file - Too small (${SIZE} bytes)"
        fi
    else
        echo "❌ $file - Missing!"
    fi
done

echo
echo "Enhanced files: $ENHANCED_COUNT/5"
echo

# Git status
echo "🔄 Git Status:"
git status --porcelain | head -10
if [ $(git status --porcelain | wc -l) -gt 10 ]; then
    echo "... and $(expr $(git status --porcelain | wc -l) - 10) more files"
fi

echo
echo "📊 Repository Health:"
echo "Commits ahead of origin: $(git rev-list --count origin/main..HEAD 2>/dev/null || echo 0)"
echo "Repository size: $(du -sh . | cut -f1)"
echo

# Check for any large files that might cause issues
echo "🔍 Large Files Check:"
find . -name "*.html" -not -path "./node_modules/*" -size +100k | head -5

echo
echo "=== Verification Complete ==="