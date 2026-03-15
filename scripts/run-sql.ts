import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnv() {
  try {
    const envFile = readFileSync(".env", "utf-8");
    const lines = envFile.split("\n");
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith("#")) continue;

      const [key, ...valueParts] = trimmedLine.split("=");
      if (!key || valueParts.length === 0) continue;

      const value = valueParts.join("=").replace(/^["']|["']$/g, "");
      process.env[key.trim()] = value.trim();
    }
  } catch {
    // .env가 없어도 시스템 환경 변수를 그대로 사용
  }
}

function usage() {
  console.log("Usage:");
  console.log('  npm run db:sql -- --sql "ALTER TABLE ...;"');
  console.log("  npm run db:sql -- --file scripts/sql/your.sql");
  console.log('  npm run db:sql -- --file scripts/sql/your.sql --db-url "postgresql://..."');
}

function parseArgs(argv: string[]) {
  let sql = "";
  let file = "";
  let dbUrl = "";

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      usage();
      process.exit(0);
    }
    if (arg === "--sql") {
      sql = argv[i + 1] || "";
      i++;
      continue;
    }
    if (arg === "--file") {
      file = argv[i + 1] || "";
      i++;
      continue;
    }
    if (arg === "--db-url") {
      dbUrl = argv[i + 1] || "";
      i++;
      continue;
    }
  }

  return { sql, file, dbUrl };
}

function splitSqlStatements(sql: string): string[] {
  const statements: string[] = [];
  let current = "";

  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    const next = sql[i + 1];

    if (inLineComment) {
      current += char;
      if (char === "\n") inLineComment = false;
      continue;
    }

    if (inBlockComment) {
      current += char;
      if (char === "*" && next === "/") {
        current += "/";
        i++;
        inBlockComment = false;
      }
      continue;
    }

    if (!inSingleQuote && !inDoubleQuote) {
      if (char === "-" && next === "-") {
        current += char + next;
        i++;
        inLineComment = true;
        continue;
      }
      if (char === "/" && next === "*") {
        current += char + next;
        i++;
        inBlockComment = true;
        continue;
      }
    }

    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      current += char;
      continue;
    }

    if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      current += char;
      continue;
    }

    if (char === ";" && !inSingleQuote && !inDoubleQuote) {
      const trimmed = current.trim();
      if (trimmed) statements.push(trimmed);
      current = "";
      continue;
    }

    current += char;
  }

  const rest = current.trim();
  if (rest) statements.push(rest);

  return statements;
}

function isQueryStatement(statement: string): boolean {
  return /^\s*(SELECT|WITH|SHOW|EXPLAIN|VALUES)\b/i.test(statement);
}

async function main() {
  loadEnv();

  const { sql, file, dbUrl } = parseArgs(process.argv.slice(2));
  if (!sql && !file) {
    usage();
    process.exit(1);
  }

  const databaseUrl =
    dbUrl ||
    process.env.DATABASE_POOLING_URL ||
    process.env.DATABASE_DIRECT_URL ||
    process.env.DATABASE_URL ||
    "";

  if (!databaseUrl) {
    console.error(
      "DATABASE_POOLING_URL, DATABASE_DIRECT_URL, DATABASE_URL 또는 --db-url 값이 필요합니다."
    );
    process.exit(1);
  }

  const sourceSql = file ? readFileSync(resolve(process.cwd(), file), "utf-8") : sql;
  const statements = splitSqlStatements(sourceSql);

  if (statements.length === 0) {
    console.error("실행할 SQL 문이 없습니다.");
    process.exit(1);
  }

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

  console.log(`Executing ${statements.length} SQL statement(s)...`);

  try {
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const label = `[${i + 1}/${statements.length}]`;

      if (isQueryStatement(statement)) {
        const rows = await prisma.$queryRawUnsafe(statement);
        console.log(`${label} QUERY OK`);
        console.log(JSON.stringify(rows, null, 2));
      } else {
        const affected = await prisma.$executeRawUnsafe(statement);
        console.log(`${label} EXEC OK (affected: ${affected})`);
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error("SQL execution failed:", message);
  process.exit(1);
});
