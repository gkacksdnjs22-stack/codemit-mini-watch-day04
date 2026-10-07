import { cp, mkdir } from "node:fs/promises";
const target = new URL("../../../general/static/portal/", import.meta.url);
await mkdir(target, { recursive: true });
await cp(new URL("../dist/assets/", import.meta.url), new URL("assets/", target), { recursive: true });
await cp(new URL("../dist/.vite/manifest.json", import.meta.url), new URL("manifest.json", target));
console.log("React login assets prepared for the general Flask service.");
