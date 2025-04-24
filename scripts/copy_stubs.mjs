import { cp } from "fs/promises";
import path from "path";

const src = path.resolve("src/stubs");
const dest = path.resolve("bin/stubs");

async function copyStubs() {
  try {
    await cp(src, dest, { recursive: true });
    console.log("📂 Stubs copied successfully!");
  } catch (err) {
    console.error("❌ Error copying stubs:", err);
  }
}

copyStubs();
