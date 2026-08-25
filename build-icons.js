import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ICONES_DIR = path.join(__dirname, 'icones');
const OUTPUT_FILE = path.join(__dirname, 'icons-registry.js');

function toCamelCase(str) {
  return str.toLowerCase().replace(/[-_]([a-z0-9])/g, (g) => g[1].toUpperCase());
}

function cleanSvg(svgContent) {
  return svgContent
    .replace(/<\?xml.*?\?>/gs, '')
    .replace(/<!DOCTYPE.*?>/gs, '')
    .replace(/<!--.*?-->/gs, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function build() {
  console.log('\x1b[36m%s\x1b[0m', '🔄 Iniciando compilação dos ícones White-Label...');

  if (!fs.existsSync(ICONES_DIR)) {
    console.error('\x1b[31m[ERRO] Diretório de ícones não existe: %s\x1b[0m', ICONES_DIR);
    process.exit(1);
  }

  const files = fs.readdirSync(ICONES_DIR);
  const svgFiles = files.filter(file => path.extname(file).toLowerCase() === '.svg');

  if (svgFiles.length === 0) {
    console.warn('\x1b[33m[AVISO] Nenhum ficheiro SVG encontrado na pasta /icones.\x1b[0m');
  }

  const processedNames = new Set();
  const iconsData = [];

  for (const file of svgFiles) {
    const filePath = path.join(ICONES_DIR, file);
    const rawName = path.parse(file).name;
    const normalizedName = rawName.toLowerCase();

    if (processedNames.has(normalizedName)) {
      console.error('\x1b[31m%s\x1b[0m', `\n❌ [ERRO DE DUPLICAÇÃO] Colisão de nome detetada: "${normalizedName}" já foi processado!`);
      console.error('\x1b[31m%s\x1b[0m', `   Ficheiro em conflito: ${file}`);
      console.error('\x1b[31m%s\x1b[0m', '   O processo de build foi abortado.');
      throw new Error(`Colisão de ícones: O nome "${normalizedName}" é duplicado.`);
    }

    processedNames.add(normalizedName);

    let content = fs.readFileSync(filePath, 'utf8');
    content = cleanSvg(content);

    if (!content.includes('<svg') || !content.includes('</svg>')) {
      console.error('\x1b[31m[ERRO] O ficheiro %s não parece conter um SVG válido.\x1b[0m', file);
      process.exit(1);
    }

    const camelCaseName = toCamelCase(rawName);

    iconsData.push({
      originalName: rawName,
      camelName: camelCaseName,
      svg: content
    });
  }

  let fileContent = `/**\n * FICHEIRO GERADO AUTOMATICAMENTE - NÃO EDITAR DIRETAMENTE\n */\n\n`;

  fileContent += `export const IconsList = [\n`;
  iconsData.forEach((icon, index) => {
    const isLast = index === iconsData.length - 1;
    fileContent += `  '${icon.originalName}'${isLast ? '' : ','}\n`;
  });
  fileContent += `];\n\n`;

  fileContent += `export const WhiteLabelIconsList = IconsList;\n`;

  fs.writeFileSync(OUTPUT_FILE, fileContent, 'utf8');

  console.log('\x1b[32m%s\x1b[0m', `✔ Registo gerado com sucesso em: ${OUTPUT_FILE}`);
  console.log('\x1b[32m%s\x1b[0m', `✔ Total de ícones compilados: ${iconsData.length}\n`);
}

try {
  build();
} catch (err) {
  console.error('\x1b[31m[FALHA NO BUILD] %s\x1b[0m', err.message);
  process.exit(1);
}
