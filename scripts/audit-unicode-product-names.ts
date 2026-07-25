/**
 * Scans Product.name/short_description/description for stylized Unicode
 * "fancy text" (Mathematical Alphanumeric Symbols, circled/fullwidth letters,
 * double-struck letterlike symbols) that Google and screen readers can't
 * read as plain text. Report-only by default; --fix writes normalized values.
 *
 * Usage:
 *   pnpm audit:product-names            # report only, no writes
 *   pnpm audit:product-names --fix       # normalize matched rows (prompts to confirm)
 *   pnpm audit:product-names --fix --yes # normalize without prompting (CI use)
 */
import { createInterface } from "node:readline/promises";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Deliberately scoped to specific "fancy text" ranges rather than the whole
// string — a blind NFKD-normalize-and-strip-combining-marks pass over an
// entire field would also mangle legitimate accented characters (e.g. "café"
// in real ingredient/brand names). Every codepoint here decomposes cleanly
// via NFKD with no leftover combining marks, so per-character replacement
// within just these ranges leaves everything else untouched.
const FANCY_RANGES =
  /[\u{1D400}-\u{1D7FF}\u{24B6}-\u{24E9}\u{FF21}-\u{FF3A}\u{FF41}-\u{FF5A}\u{2102}\u{210D}\u{2115}\u{2119}\u{211A}\u{211D}\u{2124}]/gu;

function normalizeFancyRuns(value: string): string {
  return value.replace(FANCY_RANGES, (ch) => ch.normalize("NFKD"));
}

const FIELDS = ["name", "short_description", "description"] as const;
type Field = (typeof FIELDS)[number];

interface Finding {
  productId: string;
  field: Field;
  original: string;
  normalized: string;
}

async function findOffendingRows(): Promise<Finding[]> {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      short_description: true,
      description: true,
    },
  });

  const findings: Finding[] = [];
  for (const product of products) {
    for (const field of FIELDS) {
      const original = product[field];
      if (!original) continue;
      const normalized = normalizeFancyRuns(original);
      if (normalized !== original) {
        findings.push({ productId: product.id, field, original, normalized });
      }
    }
  }
  return findings;
}

async function confirm(message: string): Promise<boolean> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(`${message} Type YES to proceed: `);
  rl.close();
  return answer.trim() === "YES";
}

async function main() {
  const args = process.argv.slice(2);
  const shouldFix = args.includes("--fix");
  const skipConfirm = args.includes("--yes");

  const findings = await findOffendingRows();

  if (findings.length === 0) {
    console.log(
      "No stylized Unicode text found in any product name/description field.",
    );
    await prisma.$disconnect();
    return;
  }

  console.log(
    `Found ${findings.length} field(s) with stylized Unicode text:\n`,
  );
  for (const finding of findings) {
    console.log(`  [${finding.productId}] ${finding.field}`);
    console.log(`    before: ${finding.original}`);
    console.log(`    after:  ${finding.normalized}\n`);
  }

  if (!shouldFix) {
    console.log(
      "Run with --fix to normalize these values. (Slugs are left untouched — see note in script.)",
    );
    await prisma.$disconnect();
    return;
  }

  if (!skipConfirm) {
    const proceed = await confirm(
      `\nThis will update ${findings.length} field(s) across the database.`,
    );
    if (!proceed) {
      console.log("Aborted — no changes made.");
      await prisma.$disconnect();
      return;
    }
  }

  const byProduct = new Map<string, Partial<Record<Field, string>>>();
  for (const finding of findings) {
    const existing = byProduct.get(finding.productId) ?? {};
    existing[finding.field] = finding.normalized;
    byProduct.set(finding.productId, existing);
  }

  for (const [productId, data] of byProduct) {
    await prisma.product.update({ where: { id: productId }, data });
  }

  console.log(`Updated ${byProduct.size} product(s).`);
  console.log(
    "Note: slugs were NOT regenerated from the corrected names — a name-derived " +
      "slug change could break the redirect/URL work already in place. Review slugs manually if needed.",
  );

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
