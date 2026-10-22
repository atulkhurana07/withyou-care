import { cpSync, mkdirSync } from "node:fs";
const source = new URL("../apps/patient-mobile/build/web/", import.meta.url);
const target = new URL("../apps/website/public/care-app/", import.meta.url);
mkdirSync(target, { recursive: true });
cpSync(source, target, { recursive: true });
console.log(
  "Flutter preview ready at http://127.0.0.1:3000/care-app/index.html",
);
