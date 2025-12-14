# 🚀 Deployment en Vercel

Guía paso a paso para deployar en Vercel desde tu GitHub.

---

## 📋 Requisitos

- ✅ GitHub repo sincronizado (ya lo tienes)
- ✅ Cuenta Vercel (https://vercel.com)
- ✅ Credenciales Spotify API

---

## 🔙 PASO 1: Deploy Backend

### 1.1 Configura en Vercel Dashboard

1. Ve a https://vercel.com/dashboard
2. Click en **"New Project"**
3. Selecciona tu repo: `search-id-from-isrc`
4. En **"Root Directory"**, selecciona: `isrc-spotify-backend`
5. Click en **"Configure"** para las variables de entorno

### 1.2 Añade Variables de Entorno

En la sección **"Environment Variables"**:

```
SPOTIFY_CLIENT_ID = abc123... (tu client ID)
SPOTIFY_CLIENT_SECRET = xyz789... (tu client secret)
NODE_ENV = production
```

### 1.3 Deploy

Click en **"Deploy"**

**Espera a que termine.** Verás un mensaje como:

```
✅ Deployment Successful
🎉 https://isrc-spotify-api.vercel.app
```

Copia esta URL, la necesitarás en el paso 2.

---

## 🎨 PASO 2: Deploy Frontend

### 2.1 Actualiza la URL del Backend

**Archivo:** `isrc-spotify-frontend/.env.production`

Reemplaza:
```
REACT_APP_API_URL=https://isrc-spotify-api.vercel.app
```

Con tu URL exacta de Vercel del Step 1.

Luego **haz push a GitHub:**

```bash
git add isrc-spotify-frontend/.env.production
git commit -m "Update backend URL for Vercel"
git push origin main
```

### 2.2 Configura en Vercel

1. Ve a https://vercel.com/dashboard
2. Click **"New Project"**
3. Selecciona tu repo: `search-id-from-isrc`
4. En **"Root Directory"**, selecciona: `isrc-spotify-frontend`
5. Las variables de entorno las toma de `.env.production` automáticamente

### 2.3 Deploy

Click en **"Deploy"**

**Espera a que termine.** Verás:

```
✅ Deployment Successful
🎉 https://isrc-spotify-frontend.vercel.app
```

---

## ✅ Verifica que Funciona

1. Abre tu URL del frontend: https://isrc-spotify-frontend.vercel.app
2. Prueba con ISRC: `USUM71505639`
3. Deberías ver: "Blinding Lights - The Weeknd"

---

## 🔄 Flujo de Actualizaciones Futuras

Cada vez que hagas push a GitHub:

1. **Frontend** se redeploya automáticamente → `isrc-spotify-frontend.vercel.app`
2. **Backend** se redeploya automáticamente → `isrc-spotify-api.vercel.app`

Vercel auto-detecta los cambios y los deploya.

---

## 🆘 Troubleshooting

### Error: "Cannot find module"

```bash
# El frontend necesita dependencias de React
# Vercel lo instala automáticamente con npm install

# Si es problema local:
cd isrc-spotify-frontend
npm install
npm start
```

### Error: "API not responding"

```
1. Verifica que el backend esté deployado
2. Verifica la URL en .env.production
3. Comprueba que las credenciales Spotify estén en Vercel
```

### Error: "Build failed"

```
1. Abre logs en Vercel Dashboard
2. Busca el error específico
3. Haz cambios en GitHub
4. Vercel redeploya automáticamente
```

---

## 🎯 URLs Finales

Después de ambos deploys, tendrás:

- **Frontend:** `https://isrc-spotify-frontend.vercel.app` (o tu custom domain)
- **Backend API:** `https://isrc-spotify-api.vercel.app` (o tu custom domain)

---

## 🔐 Seguridad

✅ Nunca commites `.env` (está en `.gitignore`)
✅ Variables de entorno van en Vercel Dashboard
✅ SPOTIFY_CLIENT_SECRET nunca en código

---

## 📝 Próximas Mejoras

Después del deployment básico, puedes:

- [ ] Añadir custom domain
- [ ] Configurar CDN
- [ ] Agregar analytics
- [ ] Configurar webhooks
- [ ] Añadir rate limiting

---

## 📞 Soporte

Si algo falla:

1. **Logs en Vercel:** Dashboard → Project → Deployments → View Logs
2. **Error local:** `npm start` y revisa consola
3. **Variables:** Verifica en Vercel Dashboard que estén correctas

---

**Listo para deployar?** 🚀

`git push origin main` y observa tu Vercel Dashboard