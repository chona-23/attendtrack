# Plan de Implementación: Despliegue a Producción con Firebase (Opción 4)

Este documento detalla el plan de acción técnico paso a paso para desplegar la aplicación **AttendTrack** a producción en **Firebase Hosting / Firebase App Hosting / Cloud Run**, integrando la base de datos Firestore, Firebase Auth y la autenticación 2FA dentro del ecosistema de Google Cloud / Firebase.

---

## User Review Required

> [!IMPORTANT]
> - **Acceso CLI de Firebase**: Se requiere contar con `firebase-tools` instalado y haber iniciado sesión en la CLI con `firebase login`.
> - **Proyecto Firebase de Producción**: Confirmar si el ID de proyecto actual es `attendtrack` o si existe un proyecto de Firebase dedicado para producción.
> - **Variables de Entorno Secretas**: Se deben declarar las variables públicas `NEXT_PUBLIC_FIREBASE_*` y la credencial de servicio `FIREBASE_SERVICE_ACCOUNT_KEY` en la configuración de entorno de Firebase App Hosting o Cloud Run.

---

## Proposed Changes

### Archivos de Configuración

#### [NEW] [firebase.json](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/firebase.json)
Archivo de configuración oficial de Firebase para habilitar soporte del framework Next.js o integración con Hosting & Cloud Run.

#### [NEW] [.firebaserc](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/.firebaserc)
Asociación del proyecto local con el ID del proyecto Firebase en producción.

---

## Step-by-Step Implementation Guide

### Paso 1: Instalar Firebase CLI (si no se encuentra instalada)
```bash
npm install -g firebase-tools
```

### Paso 2: Autenticarse en Firebase
```bash
firebase login
```

### Paso 3: Inicializar y Configurar Firebase Hosting / App Hosting
Ejecutar la inicialización interactiva para Next.js en el directorio del proyecto:
```bash
firebase init hosting
```
- Seleccionar el proyecto de Firebase existente.
- Confirmar la detección automática de **Next.js**.
- Habilitar construcciones automáticas (*automatic builds*) si se desea integración directa con GitHub (`chona-23/attendtrack`).

### Paso 4: Crear la configuración de `firebase.json`
Establecer la configuración para Next.js App Router:

```json
{
  "hosting": {
    "source": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "frameworksBackend": {
      "region": "us-central1"
    }
  }
}
```

### Paso 5: Configurar Dominios Autorizados en Firebase Auth
En la consola de Firebase:
1. Ir a **Firebase Console ➔ Authentication ➔ Settings ➔ Authorized Domains**.
2. Agregar las URLs de producción asignadas por Firebase:
   - `<PROJECT_ID>.web.app`
   - `<PROJECT_ID>.firebaseapp.com`
   - (Opcional) Tu dominio personalizado.

### Paso 6: Compilar y Desplegar a Producción
Ejecutar el despliegue directo a producción:
```bash
firebase deploy --only hosting
```

---

## Verification Plan

### Automated Verification
- **Verificación de Compilación**:
  ```bash
  npm run build
  ```
- **Verificación de Despliegue**:
  ```bash
  firebase deploy --only hosting --dry-run
  ```

### Manual Verification
1. Abrir la URL de producción proporcionada por Firebase (`https://<PROJECT_ID>.web.app`).
2. Probar el flujo completo de inicio de sesión de usuario normal y administrador.
3. Probar el registro de asistencias (Entrada, Comida, Salida) y verificar persistencia en Firestore.
4. Probar la generación y descarga de reportes CSV y PDF.
5. Probar autenticación 2FA.
