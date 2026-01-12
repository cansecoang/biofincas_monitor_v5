# Ajustes para Registro de Productos - Nueva Estructura BD

## Fecha: 2026-01-12

## Resumen de Cambios

Se ajustó el código para que funcione con la nueva estructura de base de datos de Digidee, eliminando campos obsoletos y actualizando las referencias correctas.

---

## 📋 Estructura de la Tabla Products

### Campos en la Nueva Estructura:
```sql
CREATE TABLE "public"."products" (
  "product_id" INTEGER PRIMARY KEY,
  "product_name" TEXT NOT NULL,
  "product_objective" TEXT,
  "product_output" INTEGER,                 -- Campo legacy (no usado)
  "methodology_description" TEXT,
  "deliverable" TEXT,
  "delivery_date" DATE,
  "product_owner_id" INTEGER,               -- FK a organizations
  "product_output_id" INTEGER,              -- FK a outputs ✓
  "responsable_id" INTEGER,                 -- FK a users ✓
  "country_id" INTEGER,                     -- FK a countries
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);
```

### Campos ELIMINADOS (no existen en nueva estructura):
- ❌ `gender_specific_actions`
- ❌ `next_steps`
- ❌ `workpackage_id`
- ❌ `workinggroup_id`
- ❌ `indicator_id` (relación directa - ahora se usa tabla intermedia)

### Tablas de Relación ELIMINADAS:
- ❌ `product_distributor_orgs`
- ❌ `product_distributor_others`
- ❌ `product_distributor_users`

---

## 🔧 Cambios en el Código

### 1. API Route: `/api/add-product/route.ts`

#### Cambios en el body:
```typescript
// ANTES (campos eliminados):
{
  product_output,           // ❌ Removido
  gender_specific_actions,  // ❌ Removido
  next_steps,               // ❌ Removido
  workpackage_id,           // ❌ Removido
  workinggroup_id,          // ❌ Removido
  distributor_orgs,         // ❌ Removido
  distributor_others        // ❌ Removido
}

// AHORA (campos correctos):
{
  product_output_id,        // ✓ FK a outputs
  responsable_id,           // ✓ FK a users (responsable principal)
  responsibles,             // ✓ Array para product_responsibles
  organizations,            // ✓ Array para product_organizations
  indicators               // ✓ Array para product_indicators
}
```

#### Validaciones Eliminadas:
- ❌ Validación de `workpackage_id`
- ❌ Validación de `workinggroup_id`
- ❌ Función `getWorkingGroupTableName()`

#### Validaciones Agregadas:
- ✓ Validación de `product_output_id` (outputs table)
- ✓ Validación de `responsable_id` (users table)

#### Query INSERT actualizado:
```typescript
INSERT INTO products (
  product_name, 
  product_objective,
  deliverable,
  delivery_date,
  product_output_id,          // Cambiado de product_output
  methodology_description,
  product_owner_id,
  country_id,
  responsable_id              // Agregado
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
```

### 2. Componente: `ProductStepWizard.tsx`

#### Payload actualizado:
```typescript
const payload = {
  product_name: formData.productName,
  product_objective: formData.productObjective,
  deliverable: formData.deliverable,
  delivery_date: formData.deliveryDate || null,
  methodology_description: formData.methodologyDescription || null,
  product_output_id: formData.output ? parseInt(formData.output) : null,  // Cambiado
  product_owner_id: formData.productOwner ? parseInt(formData.productOwner) : null,
  responsable_id: formData.responsable ? parseInt(formData.responsable) : null,  // Agregado
  country_id: null,
  responsibles: [...],
  organizations: [...],
  indicators: [...]
};
```

---

## 📊 Tablas de Relación

### Tablas que SÍ se usan:
1. ✓ **product_responsibles** - Múltiples responsables por producto
   ```sql
   product_id, user_id, role_label, is_primary, position, added_at
   ```

2. ✓ **product_organizations** - Organizaciones involucradas
   ```sql
   product_id, organization_id, relation_type, position
   ```

3. ✓ **product_indicators** - Indicadores relacionados
   ```sql
   product_id, indicator_id
   ```

---

## ✅ Prueba Exitosa

Se creó un script de prueba (`test-product-creation.js`) que verificó:

1. ✓ Creación de datos de prueba (country, organization, user, output, indicator)
2. ✓ Inserción de producto con todos los campos correctos
3. ✓ Relaciones en las tablas intermedias
4. ✓ Verificación con JOIN de todas las relaciones

**Resultado:** ✅ Prueba completada exitosamente

---

## 🎯 Próximos Pasos Recomendados

1. **Actualizar formulario de UI** para reflejar los campos disponibles
2. **Eliminar referencias** a workpackages y working groups del frontend
3. **Revisar APIs relacionados**:
   - `/api/update-product`
   - `/api/products` (listado)
   - Cualquier API que lea productos
4. **Actualizar tipos TypeScript** para reflejar la nueva estructura
5. **Probar el flujo completo** de creación desde la UI

---

## 📝 Notas Importantes

- El campo `product_output` existe en la BD pero **NO SE USA** (legacy)
- Usar siempre `product_output_id` para la relación con outputs
- El `responsable_id` en products es el responsable principal
- Múltiples responsables se manejan en `product_responsibles`
- NO hay tabla `product_distributor_*` en la nueva estructura

---

## 🔗 Referencias de Foreign Keys

```sql
products.product_output_id  → outputs.output_id
products.product_owner_id   → organizations.organization_id
products.responsable_id     → users.user_id
products.country_id         → countries.country_id

product_responsibles.product_id     → products.product_id
product_responsibles.user_id        → users.user_id

product_organizations.product_id    → products.product_id
product_organizations.organization_id → organizations.organization_id

product_indicators.product_id       → products.product_id
product_indicators.indicator_id     → indicators.indicator_id
```
