import fs from "fs";
import path from "path";
import xlsx from "xlsx";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const ISIC_XLSX_URL = "https://webapps.ilo.org/ilostat-files/Documents/ISIC.xlsx";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Faltam as variáveis NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function downloadFile(url, outputPath) {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Falha ao baixar arquivo: ${res.status} ${res.statusText}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  fs.writeFileSync(outputPath, Buffer.from(arrayBuffer));
}

function normalizeText(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function toPtFallback(nameEn) {
  return nameEn;
}

function extractRowsFromWorkbook(filePath) {
  const workbook = xlsx.readFile(filePath);

  const preferredSheetNames = [
    "ISIC_REV_4",
    "ISIC_Rev_4",
    "ISIC Rev. 4",
    "ISIC_Rev_4_en",
    "Sheet1",
  ];

  let worksheet = null;

  for (const name of preferredSheetNames) {
    if (workbook.Sheets[name]) {
      worksheet = workbook.Sheets[name];
      break;
    }
  }

  if (!worksheet) {
    const firstSheetName = workbook.SheetNames[0];
    worksheet = workbook.Sheets[firstSheetName];
  }

  const json = xlsx.utils.sheet_to_json(worksheet, {
    defval: "",
    raw: false,
  });

  const rows = [];

  for (const row of json) {
    const values = Object.values(row).map((v) => normalizeText(v));

    if (!values.length) continue;

    let code = "";
    let nameEn = "";

    for (const value of values) {
      if (!code && /^\d{1,4}$/.test(value)) {
        code = value;
        continue;
      }

      if (!nameEn && /[A-Za-z]/.test(value) && value.length > 2) {
        nameEn = value;
      }
    }

    if (!code || !nameEn) continue;

    rows.push({
      code,
      name_en: nameEn,
      name_pt: toPtFallback(nameEn),
    });
  }

  const dedupMap = new Map();

  for (const row of rows) {
    if (!dedupMap.has(row.code)) {
      dedupMap.set(row.code, row);
    }
  }

  return Array.from(dedupMap.values()).sort((a, b) => {
    const aNum = Number(a.code);
    const bNum = Number(b.code);
    return aNum - bNum;
  });
}

async function upsertInBatches(rows, batchSize = 500) {
  let total = 0;

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize).map((row) => ({
      ...row,
      search_text: `${row.code} ${row.name_en} ${row.name_pt}`.toLowerCase(),
    }));

    const { error } = await supabase
      .from("isic_codes")
      .upsert(batch, { onConflict: "code" });

    if (error) {
      throw error;
    }

    total += batch.length;
    console.log(`Lote importado: ${total}/${rows.length}`);
  }
}

async function main() {
  const tmpDir = path.resolve(".tmp");
  const xlsxPath = path.join(tmpDir, "isic.xlsx");

  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  console.log("Baixando base oficial ISIC...");
  await downloadFile(ISIC_XLSX_URL, xlsxPath);

  console.log("Lendo planilha...");
  const rows = extractRowsFromWorkbook(xlsxPath);

  if (!rows.length) {
    throw new Error("Nenhum registro ISIC foi encontrado na planilha.");
  }

  console.log(`Total de códigos encontrados: ${rows.length}`);

  console.log("Limpando tabela antes da importação...");
  const { error: deleteError } = await supabase
    .from("isic_codes")
    .delete()
    .neq("id", 0);

  if (deleteError) {
    throw deleteError;
  }

  console.log("Importando para o Supabase...");
  await upsertInBatches(rows, 500);

  console.log("Atualizando search_text...");
  const { error: updateError } = await supabase.rpc("run_sql_update_isic_search_text");

  if (updateError) {
    console.log("RPC opcional não encontrada. Seguindo sem ela.");
  }

  console.log("Importação concluída com sucesso.");
}

main().catch((err) => {
  console.error("Erro na importação ISIC:", err);
  process.exit(1);
});