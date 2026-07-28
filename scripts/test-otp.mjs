import "dotenv/config";
import { createHash, randomInt } from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const pepper = process.env.AUTH_SECRET || "forge-dev-pepper";

function hashCode(code, contact) {
  return createHash("sha256")
    .update(`${pepper}:${contact}:${code}`)
    .digest("hex");
}

function generateCode() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

async function createOtp({ contact, channel, purpose, name }) {
  await prisma.authOtp.updateMany({
    where: { contact, purpose, consumedAt: null },
    data: { consumedAt: new Date() },
  });
  const code = generateCode();
  await prisma.authOtp.create({
    data: {
      contact,
      channel,
      purpose,
      name: name || null,
      codeHash: hashCode(code, contact),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });
  return code;
}

async function verify({ contact, purpose, code }) {
  const row = await prisma.authOtp.findFirst({
    where: { contact, purpose, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (!row) return { ok: false, error: "missing" };
  if (row.expiresAt < new Date()) return { ok: false, error: "expired" };
  if (row.codeHash !== hashCode(code, contact)) return { ok: false, error: "bad" };
  await prisma.authOtp.update({
    where: { id: row.id },
    data: { consumedAt: new Date() },
  });
  return { ok: true, channel: row.channel, name: row.name };
}

async function main() {
  const email = `e2e_${Date.now()}@forge.test`;
  const phone = `+1555${String(Date.now()).slice(-7)}`;

  // Signup email
  const code = await createOtp({
    contact: email,
    channel: "email",
    purpose: "signup",
    name: "E2E Lifter",
  });
  const v = await verify({ contact: email, purpose: "signup", code });
  if (!v.ok) throw new Error("signup verify failed");
  const user = await prisma.user.create({
    data: {
      email,
      name: v.name || "E2E Lifter",
      emailVerified: new Date(),
    },
  });

  // Login same user
  const code2 = await createOtp({
    contact: email,
    channel: "email",
    purpose: "login",
  });
  const v2 = await verify({ contact: email, purpose: "login", code: code2 });
  if (!v2.ok) throw new Error("login verify failed");
  const again = await prisma.user.findUnique({ where: { id: user.id } });
  if (!again) throw new Error("user not remembered");

  // Phone signup
  const pcode = await createOtp({
    contact: phone,
    channel: "phone",
    purpose: "signup",
    name: "Phone User",
  });
  const pv = await verify({ contact: phone, purpose: "signup", code: pcode });
  if (!pv.ok) throw new Error("phone verify failed");
  await prisma.user.create({
    data: { phone, name: "Phone User", phoneVerified: new Date() },
  });

  // Bad code rejected
  const badCode = await createOtp({
    contact: email,
    channel: "email",
    purpose: "login",
  });
  const bad = await verify({
    contact: email,
    purpose: "login",
    code: "000000" === badCode ? "111111" : "000000",
  });
  if (bad.ok) throw new Error("bad code should fail");

  console.log(
    JSON.stringify(
      {
        ok: true,
        emailUser: user.id,
        phone,
        remembered: true,
        badCodeRejected: true,
      },
      null,
      2
    )
  );
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
