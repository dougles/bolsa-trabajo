/**
 * Importa/actualiza empleados desde un archivo .xlsx.
 *
 * Formato esperado de columnas (en este orden, con encabezado en la fila 1):
 *   A: Empresa
 *   B: N° Carnet (CI)
 *   C: Nombre Completo
 *   D: Profesión
 *   E: Puesto
 *   F: Calificación (1-10)
 *   G: Comentario
 *
 * Es idempotente: si el CI ya existe se actualiza, si no, se crea.
 * Corre contra la misma base configurada por DB_PATH (.env), igual que la app.
 *
 * Uso (requiere haber compilado antes con `npm run build`):
 *   node dist/seed/seed-employees.js <ruta-al-archivo.xlsx>
 */
import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import ExcelJS from 'exceljs';
import { resolve } from 'node:path';
import { DataSource } from 'typeorm';
import { Employee } from '../employees/employee.entity.js';

loadEnv();

const EXPECTED_HEADERS = [
  'empresa',
  'n carnet',
  'nombre completo',
  'profesion',
  'puesto',
  'calificacion (1-10)',
  'comentario',
];

// Palabras que se pegan a la palabra siguiente al armar nombre/apellido
// (ej: "Teresa del Carmen Mendoza Aguilar" -> nombre "Teresa del Carmen").
const CONNECTOR_WORDS = new Set(['de', 'del', 'la', 'las', 'los', 'y']);

interface EmployeeRow {
  empresa: string;
  ci: string;
  nombreCompleto: string;
  profesion: string;
  puesto: string;
  calificacion: number;
  comentario: string;
}

function normalizeHeader(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quita acentos
    .replace(/[°ºª]/g, '') // quita símbolos como el ° de "N° Carnet"
    .trim()
    .toLowerCase();
}

/** Divide un nombre completo en { nombre, apellido } asumiendo la convención
 * boliviana de 2 nombres + 2 apellidos, respetando conectores como "del"/"de". */
function splitFullName(fullName: string): { nombre: string; apellido: string } {
  const tokens = fullName.trim().split(/\s+/).filter(Boolean);
  const units: string[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (CONNECTOR_WORDS.has(token.toLowerCase()) && i + 1 < tokens.length) {
      units.push(`${token} ${tokens[i + 1]}`);
      i++;
    } else {
      units.push(token);
    }
  }

  if (units.length === 0) {
    return { nombre: '', apellido: fullName.trim() };
  }
  if (units.length === 1) {
    return { nombre: '', apellido: units[0] };
  }

  const apellidoCount = units.length >= 4 ? 2 : 1;
  const apellidoUnits = units.slice(-apellidoCount);
  const nombreUnits = units.slice(0, units.length - apellidoCount);

  return {
    nombre: nombreUnits.join(' '),
    apellido: apellidoUnits.join(' '),
  };
}

async function parseWorkbook(filePath: string): Promise<EmployeeRow[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error('El archivo no tiene hojas');
  }

  const headerRow = worksheet.getRow(1).values as unknown[];
  const headers = headerRow.slice(1, 8).map(normalizeHeader);
  const headersMatch = EXPECTED_HEADERS.every((expected, i) => headers[i] === expected);
  if (!headersMatch) {
    console.warn(
      'Aviso: las columnas del archivo no coinciden exactamente con las esperadas ' +
        `(Empresa, N° Carnet, Nombre Completo, Profesión, Puesto, Calificación (1-10), Comentario).\n` +
        `Encabezado leído: ${headerRow.slice(1, 8).join(' | ')}\n` +
        'Se continúa asumiendo ese mismo orden de columnas (A-G).',
    );
  }

  const rows: EmployeeRow[] = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // encabezado

    const values = row.values as unknown[]; // índice 0 vacío, A=1, B=2, ...
    const empresa = String(values[1] ?? '').trim();
    const ci = String(values[2] ?? '').trim();
    const nombreCompleto = String(values[3] ?? '').trim();
    const profesion = String(values[4] ?? '').trim();
    const puesto = String(values[5] ?? '').trim();
    const calificacion = Number(values[6]);
    const comentario = String(values[7] ?? '').trim();

    const isEmptyRow = !empresa && !ci && !nombreCompleto && !profesion;
    if (isEmptyRow) return;

    if (!ci || !nombreCompleto || !profesion || !Number.isFinite(calificacion)) {
      throw new Error(
        `Fila ${rowNumber} inválida: faltan datos obligatorios (CI, Nombre Completo, Profesión o Calificación)`,
      );
    }

    rows.push({ empresa, ci, nombreCompleto, profesion, puesto, calificacion, comentario });
  });

  return rows;
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Uso: node dist/seed/seed-employees.js <ruta-al-archivo.xlsx>');
    process.exit(1);
  }

  const resolvedPath = resolve(filePath);
  const rows = await parseWorkbook(resolvedPath);
  console.log(`Leídas ${rows.length} filas válidas de ${resolvedPath}`);

  const dataSource = new DataSource({
    type: 'better-sqlite3',
    database: process.env.DB_PATH ?? 'data/db.sqlite',
    entities: [Employee],
    synchronize: true,
  });

  await dataSource.initialize();
  const repo = dataSource.getRepository(Employee);

  let created = 0;
  let updated = 0;
  const errors: string[] = [];

  for (const row of rows) {
    try {
      const { nombre, apellido } = splitFullName(row.nombreCompleto);
      const existing = await repo.findOneBy({ ci: row.ci });

      const data = {
        ci: row.ci,
        nombre: nombre || null,
        apellido,
        profesion: row.profesion,
        puesto: row.puesto || null,
        empresa: row.empresa || null,
        calificacion: row.calificacion,
        comentario: row.comentario || null,
      };

      if (existing) {
        await repo.save({ ...existing, ...data });
        updated++;
      } else {
        await repo.save(repo.create(data));
        created++;
      }
    } catch (err) {
      errors.push(`CI ${row.ci}: ${(err as Error).message}`);
    }
  }

  await dataSource.destroy();

  console.log(`Listo. Creados: ${created}, actualizados: ${updated}, errores: ${errors.length}`);
  if (errors.length > 0) {
    console.error('Detalle de errores:');
    for (const e of errors) console.error(`  - ${e}`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('Error al importar empleados:', err);
  process.exit(1);
});
