import { execSync } from "node:child_process";

/** 执行命令；失败时抛出带 stdout/stderr 的错误 */
function run(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
  } catch (error) {
    const stdout = error.stdout?.toString() ?? "";
    const stderr = error.stderr?.toString() ?? "";
    const wrapped = new Error(`${cmd}\n${stdout}${stderr}`);
    wrapped.stdout = stdout;
    wrapped.stderr = stderr;
    throw wrapped;
  }
}

const MIGRATION = "20260703100000_init_dpp_pim";
const MIGRATION_SQL = `prisma/migrations/${MIGRATION}/migration.sql`;

try {
  run("npx prisma migrate deploy");
  console.log("Migrations applied.");
} catch (error) {
  const output = `${error.stdout ?? ""}${error.stderr ?? ""}${error.message ?? ""}`;

  // 非空数据库首次接入 Prisma Migrate 时会触发 P3005
  if (!output.includes("P3005")) {
    throw error;
  }

  console.log(
    "Non-empty database detected; applying create-only migration and baselining…",
  );
  run(
    `npx prisma db execute --file ${MIGRATION_SQL} --schema prisma/schema.prisma`,
  );
  run(`npx prisma migrate resolve --applied ${MIGRATION}`);
  console.log("Baseline complete.");
}
