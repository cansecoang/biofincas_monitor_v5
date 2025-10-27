# 🔐 Sistema de Seguridad - BioFincas Monitor

## Características de Seguridad Implementadas

### 1. Autenticación Segura
- ✅ **Hash de Contraseñas**: Bcrypt con 10 rondas de sal
- ✅ **Sesiones Seguras**: Tokens aleatorios de 64 caracteres (32 bytes)
- ✅ **Cookies HttpOnly**: Previene acceso desde JavaScript (protección XSS)
- ✅ **Cookie SameSite**: Previene ataques CSRF
- ✅ **Expiración de Sesiones**: 7 días de vida útil
- ✅ **Cookies Seguras**: HTTPS en producción

### 2. Control de Acceso Basado en Roles (RBAC)
- ✅ **4 Niveles de Roles**:
  - **Admin**: Acceso completo al sistema
  - **Manager**: Gestión de productos y tareas
  - **User**: Actualización de productos asignados
  - **Viewer**: Solo lectura

### 3. Auditoría y Trazabilidad
- ✅ **Registro de Auditoría**: Todas las acciones quedan registradas
- ✅ **IP Address Tracking**: Dirección IP de cada acción
- ✅ **User Agent Logging**: Registro del navegador/dispositivo
- ✅ **Timestamps**: Fecha y hora de cada operación

### 4. Base de Datos
- ✅ **Transacciones ACID**: Consistencia de datos garantizada
- ✅ **Foreign Keys**: Integridad referencial
- ✅ **Cascade Delete**: Limpieza automática de sesiones
- ✅ **Índices Optimizados**: Búsquedas rápidas y seguras

## Credenciales de Demostración

### Usuarios Demo
Todos los usuarios demo usan la contraseña: **OroVerde2024!**

| Email | Rol | Permisos |
|-------|-----|----------|
| admin@oroverde.com | Admin | Acceso total |
| manager@oroverde.com | Manager | Gestión de productos/tareas |
| user@oroverde.com | User | Actualización limitada |
| viewer@oroverde.com | Viewer | Solo lectura |

⚠️ **IMPORTANTE**: Cambiar estas contraseñas antes de producción.

## Configuración Inicial

### 1. Configurar Esquema RBAC
```bash
curl -X POST http://localhost:3000/api/setup-rbac
```

### 2. Crear Usuarios Demo
```bash
curl -X POST http://localhost:3000/api/seed-demo-users
```

### 3. Probar Login
Visita: `http://localhost:3000/login`

## Estructura de Tablas de Seguridad

### roles
```sql
- role_id (SERIAL PRIMARY KEY)
- role_name (VARCHAR UNIQUE)
- role_description (TEXT)
- created_at, updated_at (TIMESTAMP)
```

### user_sessions
```sql
- session_id (SERIAL PRIMARY KEY)
- user_id (INTEGER FK → users)
- session_token (VARCHAR UNIQUE) -- 64 caracteres hex
- expires_at (TIMESTAMP)
- created_at, last_accessed_at (TIMESTAMP)
```

### audit_logs
```sql
- log_id (SERIAL PRIMARY KEY)
- user_id (INTEGER FK → users)
- action (VARCHAR) -- Ej: 'create:product', 'update:task'
- resource_type (VARCHAR) -- Ej: 'product', 'task'
- resource_id (INTEGER)
- details (JSONB) -- Datos adicionales
- ip_address (VARCHAR)
- user_agent (TEXT)
- created_at (TIMESTAMP)
```

### users (campos añadidos)
```sql
- role_id (INTEGER FK → roles)
- password_hash (VARCHAR) -- Bcrypt hash
```

## Protección de APIs

### Usar Middleware de Autenticación
```typescript
import { requireAuth } from '@/lib/auth';
import { Permission } from '@/lib/rbac';

export async function POST(request: NextRequest) {
  // Requiere autenticación y permisos específicos
  const auth = await requireAuth(request, [Permission.CREATE_PRODUCT]);
  
  if (auth instanceof NextResponse) {
    return auth; // Error de autenticación/autorización
  }
  
  const { user, hasPermission } = auth;
  
  // Tu lógica aquí...
  
  // Registrar auditoría
  await logAudit(
    user.user_id,
    'create:product',
    'product',
    newProductId,
    { name: productName },
    request
  );
}
```

## Protección de Componentes React

### Usar Hook de Autenticación
```typescript
'use client';
import { useAuth } from '@/contexts/AuthContext';
import { Permission } from '@/lib/rbac';

export default function MyComponent() {
  const { user, hasPermission, logout } = useAuth();
  
  // Verificar si está autenticado
  if (!user) {
    return <div>Please login</div>;
  }
  
  // Verificar permisos específicos
  if (!hasPermission(Permission.CREATE_PRODUCT)) {
    return <div>No tienes permiso para crear productos</div>;
  }
  
  return (
    <div>
      <p>Bienvenido, {user.user_name}</p>
      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  );
}
```

## Mejores Prácticas

### ✅ Hacer
- Siempre validar permisos en el backend (nunca confiar solo en el frontend)
- Usar HTTPS en producción
- Cambiar contraseñas por defecto
- Revisar logs de auditoría regularmente
- Implementar rate limiting para prevenir fuerza bruta
- Usar variables de entorno para secretos

### ❌ No Hacer
- Nunca almacenar contraseñas en texto plano
- No exponer mensajes de error detallados al usuario
- No confiar solo en validación del cliente
- No reutilizar tokens de sesión
- No deshabilitar CORS sin entender las implicaciones

## Próximos Pasos de Seguridad (Recomendados)

1. **Rate Limiting**: Limitar intentos de login
2. **2FA**: Autenticación de dos factores
3. **Password Reset**: Flujo de recuperación de contraseña
4. **Email Verification**: Verificación de correo electrónico
5. **Session Management**: Panel para ver/revocar sesiones activas
6. **Password Policy**: Requisitos de complejidad de contraseña
7. **Account Lockout**: Bloqueo después de X intentos fallidos
8. **Security Headers**: Implementar CSP, HSTS, etc.
9. **Input Sanitization**: Prevención de inyección SQL/XSS
10. **API Rate Limiting**: Prevenir abuso de endpoints

## Contacto de Seguridad

Para reportar vulnerabilidades de seguridad, contactar a:
- Email: security@oroverde.com
- No publicar vulnerabilidades públicamente sin dar tiempo para parche

## Actualizaciones de Seguridad

- **2025-10-27**: Implementación inicial de RBAC con bcrypt
  - Hash de contraseñas con bcrypt (10 rounds)
  - Sesiones seguras con tokens aleatorios
  - Sistema de auditoría completo
  - 4 roles con permisos granulares

---

**Versión de Seguridad**: 1.0.0  
**Última Actualización**: 27 de Octubre, 2025  
**Estado**: ✅ Producción (con contraseñas por defecto - cambiar antes de deployment)
