# 🔒 Seguridad de Login - Implementación Completa

## ✅ Características de Seguridad Implementadas

### 1. **Autenticación Activada**
- ✅ Middleware de autenticación activo
- ✅ Redirección automática a login para usuarios no autenticados
- ✅ Prevención de acceso a `/login` para usuarios ya autenticados

### 2. **Rate Limiting (Límite de Intentos)**
- ✅ Máximo 5 intentos de login por IP
- ✅ Bloqueo temporal de 15 minutos después de 5 intentos fallidos
- ✅ Contador automático que se resetea tras login exitoso
- ✅ Mensaje claro al usuario con tiempo restante de espera

### 3. **Seguridad de Sesiones**
- ✅ Tokens de sesión criptográficos de 32 bytes
- ✅ Cookies HttpOnly (no accesibles desde JavaScript)
- ✅ SameSite=Strict (protección CSRF)
- ✅ Secure flag en producción (solo HTTPS)
- ✅ Expiración automática después de 7 días
- ✅ Actualización de último acceso en cada request

### 4. **Headers de Seguridad HTTP**
- ✅ X-Frame-Options: SAMEORIGIN (anti-clickjacking)
- ✅ X-Content-Type-Options: nosniff (anti-MIME sniffing)
- ✅ X-XSS-Protection: activado
- ✅ Strict-Transport-Security (HSTS)
- ✅ Referrer-Policy: strict-origin-when-cross-origin
- ✅ Permissions-Policy (bloqueo de APIs sensibles)
- ✅ Header X-Powered-By oculto

### 5. **Protección de Contraseñas**
- ✅ Hash con bcrypt (salt rounds configurables)
- ✅ Comparación segura de contraseñas
- ✅ Mensajes genéricos para intentos fallidos (no revelan si email existe)

### 6. **Sistema RBAC (Role-Based Access Control)**
- ✅ Roles: superadmin, admin, manager, editor, viewer
- ✅ Permisos granulares por rol
- ✅ Verificación de permisos en API routes
- ✅ Middleware de autorización reutilizable

## 📋 Rutas Protegidas

### Rutas Públicas (sin autenticación)
- `/login` - Página de inicio de sesión
- `/api/auth/login` - API de login

### Rutas Protegidas (requieren autenticación)
- Todas las demás rutas del sistema
- APIs en `/api/*` (excepto `/api/auth/login`)

## 🔧 Configuración

### Variables de Entorno
Copia `.env.example` a `.env.local` y configura:

```bash
# Seguridad
SESSION_SECRET="genera-un-string-aleatorio-aquí"
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_TIME_MINUTES=15
SESSION_DURATION_DAYS=7

# Base de datos
POSTGRES_URL="tu-connection-string"
```

### Generar SECRET seguro:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🚀 Uso

### Login de Usuario
```typescript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```

### Verificar Autenticación en API
```typescript
import { requireAuth } from '@/lib/auth';
import { Permission } from '@/lib/rbac';

export async function GET(request: NextRequest) {
  // Requiere permiso específico
  const authResult = await requireAuth(request, [Permission.VIEW_PRODUCTS]);
  if (authResult instanceof NextResponse) return authResult;
  
  const { user, hasPermission } = authResult;
  // Tu lógica aquí
}
```

### Usar en Componentes React
```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, hasPermission, logout } = useAuth();
  
  if (!isAuthenticated) return <Login />;
  
  return (
    <div>
      <p>Hola {user?.user_name}</p>
      {hasPermission(Permission.CREATE_PRODUCT) && (
        <button>Crear Producto</button>
      )}
      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  );
}
```

## 🛡️ Mejores Prácticas

### ✅ Hacer
- Usar HTTPS en producción
- Rotar SESSION_SECRET periódicamente
- Monitorear intentos de login fallidos
- Implementar logout en todas las pestañas
- Validar tokens en cada request importante
- Usar contraseñas fuertes (mínimo 8 caracteres)

### ❌ No Hacer
- No almacenar tokens en localStorage
- No enviar contraseñas en URLs
- No reutilizar SESSION_SECRET entre ambientes
- No deshabilitar el middleware sin razón
- No exponer errores detallados en producción

## 📊 Rate Limiting - Detalles

| Intento | Acción |
|---------|--------|
| 1-4     | Login permitido, contador incrementado |
| 5       | Login permitido, contador incrementado |
| 6+      | Bloqueado por 15 minutos |
| Exitoso | Contador reseteado a 0 |

El contador es por IP y se almacena en memoria (se pierde al reiniciar servidor).

## 🔐 Estructura de Sesión en BD

```sql
CREATE TABLE user_sessions (
  session_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id),
  session_token VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🚨 Respuestas de Error

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired session"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions",
  "required": ["CREATE_PRODUCT"],
  "userRole": "viewer"
}
```

### 429 Too Many Requests
```json
{
  "error": "Too many login attempts",
  "message": "Demasiados intentos de login. Intenta de nuevo en 12 minutos.",
  "resetAt": 1737331200000
}
```

## 📝 Changelog

### 2026-01-19
- ✅ Activado middleware de autenticación
- ✅ Implementado rate limiting (5 intentos, 15 min lockout)
- ✅ Mejorada seguridad de cookies (SameSite=strict)
- ✅ Agregados headers de seguridad HTTP
- ✅ Actualizado next.config.ts con headers globales
- ✅ Creadas variables de entorno para configuración

## 🔗 Referencias

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Next.js Security Headers](https://nextjs.org/docs/app/api-reference/next-config-js/headers)
- [bcrypt Best Practices](https://github.com/kelektiv/node.bcrypt.js#security-issues-and-concerns)

---

**Nota**: Esta implementación proporciona seguridad robusta para una aplicación Next.js. Para entornos de alta seguridad, considera agregar:
- 2FA (autenticación de dos factores)
- Detección de anomalías
- Logs de auditoría
- Rotación automática de sesiones
- IP whitelisting para roles admin
