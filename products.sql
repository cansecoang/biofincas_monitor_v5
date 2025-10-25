DO $$
DECLARE
  pid INT; -- product_id
BEGIN
  -- 0) ¿Existe ya?
  SELECT p.product_id INTO pid
  FROM products p
  WHERE p.product_name = 'Análisis de correspondencia entre beneficios agroecológicos e indicadores de sostenibilidad';

  -- 1) Crear el producto si no existe
  IF pid IS NULL THEN
    INSERT INTO products (
      product_name,
      product_objective,
      product_output,
      methodology_description,
      gender_specific_actions,
      deliverable,
      delivery_date,
      next_steps,
      workpackage_id,
      product_owner_id,
      country_id,
      workinggroup_id
    )
    VALUES (
        -- product_name
      'Análisis de correspondencia entre beneficios agroecológicos e indicadores de sostenibilidad',
      -- product_objective
      'Analizar la correspondencia entre los beneficios agroecológicos de las prácticas biodiversas (para café, cacao y banano) y los indicadores de sostenibilidad disponibles, con el fin de identificar coincidencias, brechas (gaps) y redundancias.',
      -- product_output
      1,
      -- methodology_description
      'La metodología consistió en tres etapas clave: primero, se sistematizaron y depuraron los beneficios agroecológicos reportados en el documento base, agrupándolos temáticamente; segundo, se realizó un mapeo detallado cruzando cada beneficio con los indicadores disponibles del catálogo, identificando coincidencias, vacíos (gaps) y redundancias; finalmente, se elaboró un informe analítico que propone soluciones para cubrir los gaps detectados y optimizar el sistema de indicadores, asegurando una evaluación integral de las prácticas biodiversas. ',
      -- gender_specific_actions
      '',
        -- deliverable
      'Informe',
        -- delivery_date
      DATE '2025-11-01',
        -- next_steps
      '',
      (SELECT workpackage_id  FROM workpackages WHERE workpackage_name = 'Baseline'),
      (SELECT organization_id FROM organizations WHERE organization_name = 'UNU/MCII'),
      (SELECT country_id      FROM countries     WHERE country_name     = 'Internacional'),
      (SELECT workinggroup_id FROM workinggroup  WHERE workinggroup_name = 'Biodiversity-Friendly Agricultural Practices')
    )
    RETURNING product_id INTO pid;
  END IF;







  -- 2) Indicador
  INSERT INTO product_indicators(product_id, indicator_id)
  SELECT pid, i.indicator_id
  FROM indicators i
  WHERE i.indicator_code = '1.3'
  ON CONFLICT DO NOTHING;






  -- 3) Responsables (usa nombres en users; si tienes email, mejor enlazar por email)
  -- Walter (Defensores de la Naturaleza)
  INSERT INTO product_responsibles(product_id, user_id, role_label, is_primary, position)
  SELECT pid, u.user_id, 'Primary', TRUE, 1
  FROM users u
  LEFT JOIN organizations o ON o.organization_id = u.organization_id
  WHERE u.user_name = 'Teresa de Jesús Arce Mojica'
    AND (u.user_last_name IS NULL OR u.user_last_name = '')
  ON CONFLICT DO NOTHING;






--   -- 4) Organizaciones involucradas (Main)
--   INSERT INTO product_organizations(product_id, organization_id, relation_type, position)
--   SELECT pid, o.organization_id, 'Main', 1
--   FROM organizations o
--   WHERE o.organization_name = 'Defensores de la Naturaleza'
--   ON CONFLICT DO NOTHING;
  




  -- 5) Usuarios / distribuidores del producto
  -- FDN
  INSERT INTO product_distributor_orgs(product_id, organization_id, position)
  SELECT pid, o.organization_id, 1
  FROM organizations o
  WHERE o.organization_name = 'UNU-MCII'
  ON CONFLICT DO NOTHING;



   -- Tomadores de decisiones locales -> otros (texto)
  INSERT INTO product_distributor_others(product_id, display_name, contact, position)
  VALUES (pid, 'Consorcio', NULL, 1)
  ON CONFLICT DO NOTHING;

  INSERT INTO product_distributor_others(product_id, display_name, contact, position)
  VALUES (pid, 'Componente de soluciones financieras', NULL, 1)
  ON CONFLICT DO NOTHING;

  INSERT INTO product_distributor_others(product_id, display_name, contact, position)
  VALUES (pid, 'organizaciones sombrilla', NULL, 2)
  ON CONFLICT DO NOTHING;

  

END $$;

	