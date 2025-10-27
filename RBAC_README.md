# RBAC (Role-Based Access Control) Implementation

## 📋 Overview

Este sistema implementa control de acceso basado en roles (RBAC) con autenticación segura mediante **bcrypt** para proteger la información y funcionalidades del sistema BioFincas Monitor.

## 🔒 Características de Seguridad

- ✅ **Hash de Contraseñas**: Bcrypt con 10 rondas de sal
- ✅ **Sesiones Seguras**: Tokens de 64 caracteres (32 bytes aleatorios)
- ✅ **HttpOnly Cookies**: Protección contra XSS
- ✅ **SameSite Cookies**: Protección contra CSRF
- ✅ **Auditoría Completa**: Registro de todas las acciones
- ✅ **IP Tracking**: Registro de direcciones IP
- ✅ **Expiración de Sesiones**: 7 días de duración

## 🔐 Roles y Permisos

### Roles Disponibles

1. **Admin** - Acceso completo al sistema
   - Todos los permisos
   - Gestión de usuarios y roles
   - Acceso a análisis completos

2. **Manager** - Gestión de proyectos y tareas
   - Crear/editar/eliminar productos
   - Gestionar tareas
   - Ver análisis
   - Ver usuarios (sin modificar)

3. **User** - Usuario regular
   - Ver productos
   - Actualizar productos asignados
   - Gestionar sus propias tareas
   - Ver dashboard

4. **Viewer** - Solo lectura
   - Ver productos, tareas, indicadores
   - Ver dashboard
   - Sin permisos de modificación

### Permisos por Recurso

**Products:**
- `create:product` - Crear productos
- `read:product` - Ver productos
- `update:product` - Actualizar productos
- `delete:product` - Eliminar productos

**Tasks:**
- `create:task` - Crear tareas
- `read:task` - Ver tareas
- `update:task` - Actualizar tareas
- `delete:task` - Eliminar tareas
- `update:task:status` - Cambiar estado de tareas

**Indicators:**
- `create:indicator` - Crear indicadores
- `read:indicator` - Ver indicadores
- `update:indicator` - Actualizar indicadores
- `delete:indicator` - Eliminar indicadores

**Users:**
- `create:user` - Crear usuarios
- `read:user` - Ver usuarios
- `update:user` - Actualizar usuarios
- `delete:user` - Eliminar usuarios
- `manage:roles` - Gestionar roles

**Dashboard:**
- `view:dashboard` - Ver dashboard
- `view:analytics` - Ver análisis

## 🚀 Setup

### 1. Ejecutar el schema SQL

```bash
# Opción 1: Usar el endpoint API
POST /api/setup-rbac

# Opción 2: Ejecutar directamente en PostgreSQL
psql -U postgres -d BioFincas -f database/rbac_schema.sql
```

### 2. Crear usuarios demo

```bash
POST /api/seed-demo-users
```

Esto creará 4 usuarios de prueba con contraseñas seguras:

| Email | Rol | Contraseña |
|-------|-----|------------|
| admin@oroverde.com | Admin | OroVerde2024! |
| manager@oroverde.com | Manager | OroVerde2024! |
| user@oroverde.com | User | OroVerde2024! |
| viewer@oroverde.com | Viewer | OroVerde2024! |

⚠️ **IMPORTANTE**: Cambiar estas contraseñas antes de producción usando el endpoint `/api/auth/change-password`

### 3. Probar el Login

Visita `http://localhost:3000/login` y usa cualquiera de las credenciales de arriba.

## 💻 Uso en el Código

### En API Routes

```typescript
import { requireAuth, logAudit } from '@/lib/auth';
import { Permission } from '@/lib/rbac';

export async function POST(request: NextRequest) {
  // Verificar autenticación y permisos
  const authResult = await requireAuth(request, [Permission.CREATE_PRODUCT]);
  if (authResult instanceof NextResponse) return authResult;
  
  const { user } = authResult;
  
  // Tu lógica aquí...
  const product = await createProduct(data);
  
  // Log de auditoría
  await logAudit(
    user.user_id,
    'CREATE_PRODUCT',
    'product',
    product.id,
    { name: product.name },
    request
  );
  
  return NextResponse.json({ success: true, product });
}
```

### En Componentes React

```typescript
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Permission } from '@/lib/rbac';

export default function ProductActions() {
  const { user, hasPermission } = useAuth();
  
  return (
    <div>
      {hasPermission(Permission.CREATE_PRODUCT) && (
        <button onClick={createProduct}>Create Product</button>
      )}
      
      {hasPermission(Permission.UPDATE_PRODUCT) && (
        <button onClick={editProduct}>Edit Product</button>
      )}
      
      {hasPermission(Permission.DELETE_PRODUCT) && (
        <button onClick={deleteProduct}>Delete Product</button>
      )}
    </div>
  );
}
```

### Proteger Rutas del Cliente

```typescript
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);
  
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return null;
  
  return <div>Protected Content</div>;
}
```

## 📊 Audit Logs

Todas las acciones importantes se registran en `audit_logs`:

```sql
SELECT 
  al.*,
  u.user_name,
  u.user_email
FROM audit_logs al
JOIN users u ON u.user_id = al.user_id
ORDER BY al.created_at DESC
LIMIT 50;
```

## 🔧 Mantenimiento

### Limpiar sesiones expiradas

```sql
-- Ejecutar periódicamente (cron job)
SELECT cleanup_expired_sessions();
```

### Ver usuarios con roles

```sql
SELECT * FROM users_with_roles;
```

### Cambiar rol de un usuario

```sql
UPDATE users 
SET role_id = (SELECT role_id FROM roles WHERE role_name = 'manager')
WHERE user_email = 'someone@example.com';
```

## 🔒 Seguridad

1. **Session Tokens**: 32-byte random tokens almacenados en cookies HttpOnly
2. **Expiration**: Las sesiones expiran después de 7 días
3. **Audit Trail**: Todas las acciones se registran con IP y User-Agent
4. **Permission Checks**: Se verifican en cada request API

## 📝 Próximos Pasos

1. Agregar AuthProvider al layout principal
2. Proteger rutas API existentes con `requireAuth`
3. Implementar UI para gestión de usuarios (solo Admin)
4. Agregar rate limiting
5. Implementar refresh tokens
6. Agregar autenticación con password real (bcrypt)
7. Implementar OAuth/SSO si es necesario
