════════════════════════════════════════════════════════════════

❓ ¿QUÉ HACE ESTA HERRAMIENTA?
════════════════════════════════════════════════════════════════

✅ Busca tracks en Spotify por su ISRC (código de 12 caracteres)
✅ Retorna ID de Spotify, metadata, y link directo
✅ Útil para distribución, análisis y automatización
✅ Interfaz web moderna y API REST

Ejemplo:
   Entrada:  ISRC: USUM71505639
   Salida:   {
               "id": "3qm86nIvCmVrRSHezMqD4v",
               "name": "Blinding Lights",
               "artists": "The Weeknd",
               "popularity": 95,
               ...
             }

════════════════════════════════════════════════════════════════

✨ LO QUE INCLUYE ESTA HERRAMIENTA
════════════════════════════════════════════════════════════════

📂 Backend (Node.js + Express):
   - API REST con 3 endpoints
   - Autenticación Spotify automática
   - Caché de tokens
   - Validación de ISRC
   - Docker ready

🎨 Frontend (React):
   - UI moderna y responsiva
   - Búsqueda por ISRC
   - Búsqueda por título/artista
   - Visualización de metadata
   - Preview de audio
   - Link directo a Spotify
   - Gráficos de popularidad

🛠️ Herramientas extra:
   - Docker Compose (orquestación)
   - Ejemplos de código JavaScript
   - Documentación completa
   - Setup automático

════════════════════════════════════════════════════════════════

💼 CASOS DE USO (PARA DISTRIFY.ME)
════════════════════════════════════════════════════════════════

✓ Verificar ISRCs antes de distribuir
✓ Mapear catálogos a Spotify automáticamente
✓ Obtener IDs de Spotify en tiempo real
✓ Analizar datos de popularidad
✓ Integrar en flujos de trabajo
✓ Procesar múltiples ISRCs en batch

════════════════════════════════════════════════════════════════

# ⚡ Quick Start - 5 Minutos

## 1️⃣ Obtener Credenciales Spotify (2 min)

1. Ve a https://developer.spotify.com/dashboard
2. Crea app → "ISRC Lookup"
3. Copia **Client ID** y **Client Secret**

```
Client ID:     abc123def456
Client Secret: xyz789uvw012
```

## 2️⃣ Setup Backend (2 min)

```bash
# Entra a carpeta backend
cd isrc-spotify-backend

# Instala dependencias
npm install

# Crea archivo .env
cat > .env << EOF
SPOTIFY_CLIENT_ID=tu_client_id
SPOTIFY_CLIENT_SECRET=tu_client_secret
PORT=5000
NODE_ENV=development
EOF

# Inicia servidor
npm run dev
```

Deberías ver: `🎵 ISRC Spotify API escuchando en puerto 5000`

## 3️⃣ Setup Frontend (1 min)

**Opción A: Si ya tienes proyecto React**

Copia estos archivos a tu proyecto:
```
isrc-spotify-frontend/ISRCSearcher.jsx  → tu-proyecto/src/components/
isrc-spotify-frontend/ISRCSearcher.css  → tu-proyecto/src/components/
```

Importa en App.jsx:
```jsx
import ISRCSearcher from './components/ISRCSearcher';

function App() {
  return <ISRCSearcher apiUrl="http://localhost:5000" />;
}
```

```bash
npm start
```

**Opción B: Nuevo proyecto**

```bash
npx create-react-app isrc-app
cd isrc-app

npm install axios

# Copia componentes...
npm start
```

## 4️⃣ Prueba la Herramienta ✅

1. Abre http://localhost:3000
2. Prueba con ISRC: `USUM71505639`
3. Deberías ver el track "Blinding Lights" de The Weeknd

---

## 🚀 Con Docker (Alternativa)

Si tienes Docker instalado:

```bash
# En la raíz del proyecto
cp .env.example .env
# Edita .env con tus credenciales

docker-compose up --build
```

Frontend: http://localhost:3000
Backend: http://localhost:5000/api/health

---

## 🧪 API Directa

```bash
# ISRC lookup
curl "http://localhost:5000/api/search-isrc?isrc=USUM71505639"

# Búsqueda text
curl "http://localhost:5000/api/search?q=blinding%20lights"

# Health check
curl "http://localhost:5000/api/health"
```

---

## 💡 ISRCs para Testear

```
USUM71505639  → Blinding Lights - The Weeknd
GBUM72206000  → Shape of You - Ed Sheeran
USTH91918251  → Levitating - Dua Lipa
USUM71900245  → Don't Start Now - Dua Lipa
```

---

## ❌ Problemas Comunes

**Error: "Cannot find module"**
```bash
npm install
```

**"Port already in use"**
```bash
PORT=5001 npm start
```

**"CORS error"**
- Asegúrate que backend está corriendo (`npm run dev`)
- Frontend tiene URL correcta: `apiUrl="http://localhost:5000"`

---

## 📚 Siguiente Paso

Lee **README.md** completo para:
- Deploy a producción
- Integración API
- Troubleshooting detallado
- Características avanzadas

---

**¿Preguntas?** Contacta Distrify.me 🎵
