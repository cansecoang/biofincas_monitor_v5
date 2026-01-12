const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: 'postgres://02742d9d0b869f1a14dbb99efeed1fedc40ffe9a6ab10ed2b3c7a0aee85d9ae9:sk_OMqwSCOH5Fzw8LsyuLuWB@db.prisma.io:5432/postgres?sslmode=require'
});

async function setupDatabase() {
  try {
    console.log('Iniciando creación de estructura de base de datos para Digidee...\n');

    // Crear tablas principales
    console.log('1. Creando tabla countries...');
    await pool.query(`
      CREATE TABLE "public"."countries" (
        "country_id" SERIAL PRIMARY KEY,
        "country_name" TEXT NOT NULL UNIQUE
      );
    `);

    console.log('2. Creando tabla organizations...');
    await pool.query(`
      CREATE TABLE "public"."organizations" (
        "organization_id" SERIAL PRIMARY KEY,
        "organization_name" TEXT NOT NULL UNIQUE,
        "organization_description" TEXT,
        "country_id" INTEGER,
        "organization_type" CHAR(1)
      );
    `);

    console.log('3. Creando tabla users...');
    await pool.query(`
      CREATE TABLE "public"."users" (
        "user_id" SERIAL PRIMARY KEY,
        "user_name" TEXT NOT NULL,
        "user_last_name" TEXT,
        "user_email" TEXT NOT NULL UNIQUE,
        "organization_id" INTEGER,
        "country_id" INTEGER
      );
    `);

    console.log('4. Creando tabla outputs...');
    await pool.query(`
      CREATE TABLE "public"."outputs" (
        "output_id" SERIAL PRIMARY KEY,
        "output_number" VARCHAR(50) NOT NULL UNIQUE,
        "output_name" TEXT NOT NULL,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('5. Creando tabla indicators...');
    await pool.query(`
      CREATE TABLE "public"."indicators" (
        "indicator_id" SERIAL PRIMARY KEY,
        "indicator_code" TEXT UNIQUE,
        "output_number" INTEGER,
        "indicator_description" TEXT,
        "workpackage_id" INTEGER
      );
    `);

    console.log('6. Creando tabla phases...');
    await pool.query(`
      CREATE TABLE "public"."phases" (
        "phase_id" SERIAL PRIMARY KEY,
        "phase_name" TEXT NOT NULL UNIQUE,
        "phase_description" TEXT
      );
    `);

    console.log('7. Creando tabla status...');
    await pool.query(`
      CREATE TABLE "public"."status" (
        "status_id" SERIAL PRIMARY KEY,
        "status_name" TEXT NOT NULL UNIQUE,
        "status_description" TEXT
      );
    `);

    console.log('8. Creando tabla checkins...');
    await pool.query(`
      CREATE TABLE "public"."checkins" (
        "checkin_id" SERIAL PRIMARY KEY,
        "checkin_with_id" INTEGER,
        "checkin_date" TIMESTAMPTZ,
        "checkin_description" TEXT
      );
    `);

    console.log('9. Creando tabla products...');
    await pool.query(`
      CREATE TABLE "public"."products" (
        "product_id" SERIAL PRIMARY KEY,
        "product_name" TEXT NOT NULL,
        "product_objective" TEXT,
        "product_output" INTEGER,
        "methodology_description" TEXT,
        "deliverable" TEXT,
        "delivery_date" DATE,
        "product_owner_id" INTEGER,
        "product_output_id" INTEGER,
        "responsable_id" INTEGER,
        "country_id" INTEGER,
        "created_at" TIMESTAMPTZ DEFAULT now(),
        "updated_at" TIMESTAMPTZ DEFAULT now()
      );
    `);

    console.log('10. Creando tabla tasks...');
    await pool.query(`
      CREATE TABLE "public"."tasks" (
        "task_id" SERIAL PRIMARY KEY,
        "task_name" TEXT NOT NULL,
        "task_detail" TEXT,
        "start_date_planned" DATE,
        "end_date_planned" DATE,
        "start_date_actual" DATE,
        "end_date_actual" DATE,
        "checkin_id" INTEGER,
        "phase_id" INTEGER,
        "status_id" INTEGER,
        "responsable_id" INTEGER,
        "product_id" INTEGER
      );
    `);

    console.log('11. Creando tabla product_indicators...');
    await pool.query(`
      CREATE TABLE "public"."product_indicators" (
        "product_id" INTEGER NOT NULL,
        "indicator_id" INTEGER NOT NULL,
        PRIMARY KEY ("product_id", "indicator_id")
      );
    `);

    console.log('12. Creando tabla product_organizations...');
    await pool.query(`
      CREATE TABLE "public"."product_organizations" (
        "product_id" INTEGER NOT NULL,
        "organization_id" INTEGER NOT NULL,
        "relation_type" TEXT,
        "position" SMALLINT,
        PRIMARY KEY ("product_id", "organization_id")
      );
    `);

    console.log('13. Creando tabla product_responsibles...');
    await pool.query(`
      CREATE TABLE "public"."product_responsibles" (
        "product_id" INTEGER NOT NULL,
        "user_id" INTEGER NOT NULL,
        "role_label" TEXT,
        "is_primary" BOOLEAN DEFAULT false,
        "position" SMALLINT,
        "added_at" TIMESTAMPTZ DEFAULT now(),
        PRIMARY KEY ("product_id", "user_id")
      );
    `);

    console.log('\n14. Agregando Foreign Keys...');
    
    // Foreign keys para organizations
    await pool.query('ALTER TABLE "public"."organizations" ADD CONSTRAINT "organizations_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "public"."countries" ("country_id");');
    
    // Foreign keys para users
    await pool.query('ALTER TABLE "public"."users" ADD CONSTRAINT "users_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "public"."countries" ("country_id");');
    await pool.query('ALTER TABLE "public"."users" ADD CONSTRAINT "users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations" ("organization_id");');
    
    // Foreign keys para checkins
    await pool.query('ALTER TABLE "public"."checkins" ADD CONSTRAINT "checkin_with_id_fkey" FOREIGN KEY ("checkin_with_id") REFERENCES "public"."organizations" ("organization_id");');
    
    // Foreign keys para products
    await pool.query('ALTER TABLE "public"."products" ADD CONSTRAINT "products_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "public"."countries" ("country_id");');
    await pool.query('ALTER TABLE "public"."products" ADD CONSTRAINT "products_product_owner_id_fkey" FOREIGN KEY ("product_owner_id") REFERENCES "public"."organizations" ("organization_id");');
    await pool.query('ALTER TABLE "public"."products" ADD CONSTRAINT "products_responsable_id_fkey" FOREIGN KEY ("responsable_id") REFERENCES "public"."users" ("user_id");');
    await pool.query('ALTER TABLE "public"."products" ADD CONSTRAINT "product_output_id_fkey" FOREIGN KEY ("product_output_id") REFERENCES "public"."outputs" ("output_id");');
    
    // Foreign keys para tasks
    await pool.query('ALTER TABLE "public"."tasks" ADD CONSTRAINT "tasks_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "public"."phases" ("phase_id");');
    await pool.query('ALTER TABLE "public"."tasks" ADD CONSTRAINT "tasks_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products" ("product_id");');
    await pool.query('ALTER TABLE "public"."tasks" ADD CONSTRAINT "tasks_responsable_id_fkey" FOREIGN KEY ("responsable_id") REFERENCES "public"."organizations" ("organization_id");');
    await pool.query('ALTER TABLE "public"."tasks" ADD CONSTRAINT "tasks_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "public"."status" ("status_id");');
    await pool.query('ALTER TABLE "public"."tasks" ADD CONSTRAINT "task_checkin_id_fkey" FOREIGN KEY ("checkin_id") REFERENCES "public"."checkins" ("checkin_id");');
    
    // Foreign keys para product_indicators
    await pool.query('ALTER TABLE "public"."product_indicators" ADD CONSTRAINT "product_indicators_indicator_id_fkey" FOREIGN KEY ("indicator_id") REFERENCES "public"."indicators" ("indicator_id");');
    await pool.query('ALTER TABLE "public"."product_indicators" ADD CONSTRAINT "product_indicators_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products" ("product_id");');
    
    // Foreign keys para product_organizations
    await pool.query('ALTER TABLE "public"."product_organizations" ADD CONSTRAINT "product_organizations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations" ("organization_id");');
    await pool.query('ALTER TABLE "public"."product_organizations" ADD CONSTRAINT "product_organizations_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products" ("product_id");');
    
    // Foreign keys para product_responsibles
    await pool.query('ALTER TABLE "public"."product_responsibles" ADD CONSTRAINT "product_responsibles_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products" ("product_id");');
    await pool.query('ALTER TABLE "public"."product_responsibles" ADD CONSTRAINT "product_responsibles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("user_id");');

    console.log('\n15. Creando índices...');
    
    await pool.query('CREATE INDEX idx_product_indicators_indicator ON public.product_indicators USING btree (indicator_id);');
    await pool.query('CREATE INDEX idx_product_indicators_product ON public.product_indicators USING btree (product_id);');
    await pool.query('CREATE INDEX idx_product_orgs_org ON public.product_organizations USING btree (organization_id);');
    await pool.query('CREATE INDEX idx_product_responsibles_user ON public.product_responsibles USING btree (user_id);');
    await pool.query('CREATE INDEX idx_products_country ON public.products USING btree (country_id);');
    await pool.query('CREATE INDEX idx_products_owner ON public.products USING btree (product_owner_id);');

    console.log('\n✅ Base de datos Digidee creada exitosamente!');
    console.log('\nResumen:');
    console.log('- 13 tablas creadas');
    console.log('- 19 foreign keys configuradas');
    console.log('- 6 índices adicionales creados');
    
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    console.error('Stack:', err.stack);
  } finally {
    await pool.end();
  }
}

setupDatabase();
