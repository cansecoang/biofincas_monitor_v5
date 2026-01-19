# 🚀 Guía Rápida: Configurar Usuarios con Contraseñas

## Problema Identificado
❌ La tabla `users` en la base de datos **NO tiene la columna `password_hash`**
❌ Los usuarios existentes no tienen contraseñas configuradas

## Solución Rápida (2 opciones)

### Opción 1: Script Automático Node.js (RECOMENDADO) ⚡

```bash
# Ejecutar el script de configuración
node setup-users.js
```

Este script hará automáticamente:
- ✅ Agregar la columna `password_hash` a la tabla users
- ✅ Crear 4 usuarios demo con diferentes roles
- ✅ Hashear todas las contraseñas con bcrypt
- ✅ Asignar contraseña por defecto a usuarios existentes sin contraseña
- ✅ Mostrar resumen completo

**Usuarios que se crearán/actualizarán:**
| Email | Rol | Password |
|-------|-----|----------|
| admin@oroverde.com | admin | oroverde2025? |
| manager@oroverde.com | manager | oroverde2025? |
| user@oroverde.com | user | oroverde2025? |
| viewer@oroverde.com | viewer | oroverde2025? |

---

### Opción 2: API Endpoint (Alternativa)

1. **Primero, agregar la columna manualmente en la BD:**
   ```sql
   ALTER TABLE users 
   ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
   ```

2. **Luego, llamar al API desde tu navegador o Postman:**
   ```
   POST http://localhost:3000/api/seed-demo-users
   ```

---

## ✅ Verificación

Después de ejecutar cualquiera de las opciones:

1. **Probar el login:**
   - Ir a: `http://localhost:3000/login`
   - Email: `admin@oroverde.com`
   - Password: `oroverde2025?`

2. **Verificar en la base de datos:**
   ```sql
   SELECT 
       user_id,
       user_email,
       CASE 
           WHEN password_hash IS NULL THEN 'NO PASSWORD ❌'
           ELSE 'PASSWORD SET ✅'
       END as status
   FROM users;
   ```

---

## 📊 Estado Actual de RBAC

Tu sistema tiene estos roles configurados:

| Rol | Permisos |
|-----|----------|
| **superadmin** | Todos los permisos del sistema |
| **admin** | Gestión completa de productos, tareas y usuarios |
| **manager** | Crear y editar productos, tareas |
| **editor** | Editar productos y tareas asignadas |
| **viewer** | Solo lectura |

---

## 🔒 Características de Seguridad Activas

- ✅ **Rate Limiting**: 5 intentos max, bloqueo 15 min
- ✅ **Bcrypt Hashing**: 10 rounds de salt
- ✅ **Session Cookies**: HttpOnly, Secure, SameSite=strict
- ✅ **Middleware Activo**: Todas las rutas protegidas
- ✅ **Headers de Seguridad**: HSTS, X-Frame-Options, etc.

---

## ⚠️ IMPORTANTE - Seguridad

### Después de configurar:
1. ✅ Cambia la contraseña del admin inmediatamente
2. ✅ NO uses `oroverde2025?` en producción
3. ✅ Configura contraseñas únicas para cada usuario
4. ✅ Activa HTTPS en producción

### Variables de Entorno Necesarias:
```bash
# .env.local
POSTGRES_URL="tu-connection-string"
SESSION_SECRET="genera-un-random-string"
NODE_ENV="development"
```

---

## 🐛 Solución de Problemas

### Error: "Column password_hash does not exist"
**Solución:** Ejecutar primero la migración SQL:
```bash
psql $POSTGRES_URL -f database/add_password_column.sql
```

### Error: "Connection refused"
**Solución:** Verificar que POSTGRES_URL esté correctamente configurado en `.env`

### Error: "bcryptjs not found"
**Solución:** 
```bash
npm install bcryptjs @types/bcryptjs
```

### Los usuarios existentes no pueden hacer login
**Solución:** El script `setup-users.js` les asignará automáticamente la contraseña por defecto

---

## 📝 Próximos Pasos

Después de configurar los usuarios:

1. ✅ Probar login con usuario admin
2. ✅ Verificar que el middleware redirecciona correctamente
3. ✅ Probar rate limiting (5 intentos fallidos)
4. ✅ Cambiar contraseñas por defecto
5. ✅ Configurar roles específicos para usuarios reales

---

## 🔗 Archivos Relacionados

- Script de setup: `setup-users.js`
- Migración SQL: `database/add_password_column.sql`
- API de seed: `src/app/api/seed-demo-users/route.ts`
- Documentación completa: `SECURITY_LOGIN.md`

---

**¿Listo para empezar?**
```bash
node setup-users.js
```
