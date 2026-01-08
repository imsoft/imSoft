#!/bin/bash

# Script para copiar el SQL de políticas al portapapeles
# Uso: ./copy-sql-for-dashboard.sh

echo "📋 Copiando SQL al portapapeles..."

# Detectar sistema operativo y copiar al portapapeles
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    cat setup-storage-policies-simple.sql | pbcopy
    echo "✅ SQL copiado al portapapeles (macOS)"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    if command -v xclip &> /dev/null; then
        cat setup-storage-policies-simple.sql | xclip -selection clipboard
        echo "✅ SQL copiado al portapapeles (Linux)"
    else
        echo "⚠️  xclip no está instalado. Instálalo con: sudo apt-get install xclip"
        echo "📄 Mientras tanto, copia manualmente el contenido de setup-storage-policies-simple.sql"
    fi
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    # Windows (Git Bash)
    cat setup-storage-policies-simple.sql | clip
    echo "✅ SQL copiado al portapapeles (Windows)"
else
    echo "⚠️  Sistema operativo no reconocido"
    echo "📄 Copia manualmente el contenido de setup-storage-policies-simple.sql"
fi

echo ""
echo "📝 Siguientes pasos:"
echo "   1. Ve a Supabase Dashboard > SQL Editor"
echo "   2. Pega el contenido (Cmd+V / Ctrl+V)"
echo "   3. Haz clic en 'Run'"
echo ""
