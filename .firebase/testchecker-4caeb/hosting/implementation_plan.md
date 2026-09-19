# Plan de Implementación: Despliegue a Producción de AttendTrack

Este documento presenta las opciones de arquitectura y el plan paso a paso para desplegar la aplicación **AttendTrack** a un entorno de **producción** seguro, de alto rendimiento y alta disponibilidad.

---

## Opciones de Despliegue a Producción

| Opción | Infraestructura | Ventajas | Recomendado para |
|---|---|---|---|
| **Opción 1 (Recomendada)** | **Vercel** (Conectado a GitHub `chona-23/attendtrack`) | • Cero configuración para Next.js 16<br>• Despliegue automático en cada `git push`<br>• SSL/HTTPS automático e ilimitado<br>• CDN Global Edge de ultra baja latencia<br>• Soporte nativo para Serverless API Routes | Producción rápida, escalable y sin mantenimiento de servidores. |
| **Opción 2** | **Contenedor Docker en Render / Railway / Cloud Run** | • Aprovecha la imagen [`docker/Dockerfile`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/docker/Dockerfile) existente<br>• Portabilidad total entre cualquier proveedor (AWS, GCP, DigitalOcean)<br>• Control completo del runtime de Node.js | Si se requiere despliegue multi-cloud o contenedores independientes. |
| **Opción 3** | **Servidor VPS Dedicado (DigitalOcean / Hetzner / AWS EC2)** | • Ejecución mediante `docker-compose` y Nginx reverse proxy con Let's Encrypt<br>• Costo fijo mensual ($5–$12 USD) | Control absoluto sobre la infraestructura y servidor propio. |
| **Opción 4** | **Firebase Hosting + Cloud Run / Firebase Frameworks** | • Integración dentro de la consola de Google Cloud / Firebase | Mantener todo el stack dentro de Google Cloud. |

---

## User Review Required

> [!IMPORTANT]
> - **Variables de Entorno en Producción**: Se deben configurar las llaves públicas de Firebase (`NEXT_PUBLIC_FIREBASE_*`) y la llave privada del Service Account de Firebase Admin (`FIREBASE_SERVICE_ACCOUNT_KEY`) en el panel del proveedor seleccionado.
> - **Dominio Personalizado (opcional)**: Si posees un dominio (ej. `midominio.com`), se puede asociar mediante registros DNS A/CNAME para obtener HTTPS automático.
> - **Build de Producción Local**: En Next.js 16 se valida que la compilación pase limpiamente usando `npm run build` sin errores.

---

## Open Questions

> [!IMPORTANT]
> 1. ¿Prefieres desplegar en **Vercel** (despliegue automático instantáneo al conectar con tu GitHub `chona-23/attendtrack`) o prefieres usar **Docker** en un servidor/proveedor específico?
> 2. ¿Cuentas con un **dominio personalizado** (ej. `asistencia.tuempresa.com`) que quieras asociar a la plataforma?

---

## Proposed Plan (Vercel - Opción Recomendada)

### Fase 1: Preparación de Variables de Entorno de Producción
Configurar el listado completo de variables requeridas:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=attendtrack.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=attendtrack
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=attendtrack.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=1:...
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

### Fase 2: Configuración del Servicio de Despliegue en Vercel
1. Iniciar sesión en [Vercel](https://vercel.com) con la cuenta de GitHub `chona-23`.
2. Importar el repositorio `chona-23/attendtrack`.
3. Configurar las variables de entorno en el panel *Environment Variables*.
4. Hacer clic en **Deploy**.

### Fase 3: Configuración de Firebase Auth (Dominios Permitidos)
Agregar la URL de producción (ej. `attendtrack.vercel.app` o tu dominio personalizado) en la consola de Firebase:
- Ir a **Firebase Console ➔ Authentication ➔ Settings ➔ Authorized Domains**.
- Agregar la nueva URL de producción para permitir inicios de sesión y autenticación 2FA.

### Fase 4: Dominio Personalizado y SSL (Opcional)
- Configurar CNAME `cname.vercel-dns.com` o A Record `76.76.21.21` en el proveedor DNS (GoDaddy, Cloudflare, Namecheap).

---

## Verification Plan

### Automated Verification
- **Health Check & Build Check**:
  ```bash
  npm run build
  ```
- **Verificación de Enrutamiento y API**: Probar los endpoints API (`/api/admin/employees`, `/api/auth/verify-totp`).

### Manual Verification
1. Probar flujo de Login como Usuario Normal (`nachoyal@gmail.com`).
2. Probar registro de Entrada, Comida y Salida.
3. Probar flujo de Login como Admin (`nachoyal@hotmail.com`).
4. Generar y exportar reportes PDF y CSV desde la plataforma en producción.
5. Probar autenticación 2FA y cambio de contraseña.
