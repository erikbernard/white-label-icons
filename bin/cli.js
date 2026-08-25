#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PACKAGE_ROOT = path.resolve(__dirname, '..');
const SOURCE_ICONS_DIR = path.join(PACKAGE_ROOT, 'icones');

// Utilitários de cores no terminal
const c = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  red: '\x1b[31m',
};

function printBanner() {
  console.log(`\n${c.cyan}${c.bright}======================================================${c.reset}`);
  console.log(`${c.magenta}${c.bright}    🎨 White-Label Icons CLI (@erikbernard/white-label-icons) ${c.reset}`);
  console.log(`${c.cyan}${c.bright}======================================================${c.reset}\n`);
}

function printHelp() {
  printBanner();
  console.log(`Uso:
  ${c.green}npx @erikbernard/white-label-icons init${c.reset} [opções]
  ${c.green}npx wl-icons init${c.reset} [opções]

Opções:
  ${c.yellow}-p, --prefix <valor>${c.reset}     Prefixo das classes CSS (ex: 'empresa' para <i class="empresa-bx-user">)
  ${c.yellow}-t, --tag <valor>${c.reset}        Nome da tag Web Component (ex: 'empresa-icone' ou 'empresa-icon')
  ${c.yellow}-a, --assets <pasta>${c.reset}     Caminho de destino para os arquivos SVG (padrão: 'src/assets/icones')
  ${c.yellow}-i, --init-file <caminho>${c.reset} Arquivo de inicialização a ser gerado (padrão: 'src/icons-init.ts')
  ${c.yellow}-y, --yes${c.reset}                Aceitar todos os padrões sem perguntas interativas
  ${c.yellow}-h, --help${c.reset}               Exibir esta ajuda
  ${c.yellow}-v, --version${c.reset}            Exibir a versão instalada
`);
}

function parseArgs(args) {
  const parsed = {
    command: 'init',
    prefix: '',
    tag: '',
    assets: '',
    initFile: '',
    yes: false,
    help: false,
    version: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === 'init') {
      parsed.command = 'init';
    } else if (arg === '-h' || arg === '--help') {
      parsed.help = true;
    } else if (arg === '-v' || arg === '--version') {
      parsed.version = true;
    } else if (arg === '-y' || arg === '--yes') {
      parsed.yes = true;
    } else if (arg.startsWith('--prefix=')) {
      parsed.prefix = arg.split('=')[1];
    } else if (arg === '-p' && args[i + 1]) {
      parsed.prefix = args[++i];
    } else if (arg.startsWith('--tag=')) {
      parsed.tag = arg.split('=')[1];
    } else if (arg === '-t' && args[i + 1]) {
      parsed.tag = args[++i];
    } else if (arg.startsWith('--assets=')) {
      parsed.assets = arg.split('=')[1];
    } else if (arg === '-a' && args[i + 1]) {
      parsed.assets = args[++i];
    } else if (arg.startsWith('--init-file=')) {
      parsed.initFile = arg.split('=')[1];
    } else if (arg === '-i' && args[i + 1]) {
      parsed.initFile = args[++i];
    }
  }

  return parsed;
}

function askQuestion(rl, question, defaultValue) {
  return new Promise((resolve) => {
    const promptText = defaultValue
      ? `${c.bright}${question}${c.reset} ${c.yellow}(padrão: ${defaultValue})${c.reset}: `
      : `${c.bright}${question}${c.reset}: `;
    
    rl.question(promptText, (answer) => {
      const trimmed = answer.trim();
      resolve(trimmed || defaultValue);
    });
  });
}

function copyDirectoryRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    throw new Error(`Diretório de origem não encontrado: ${src}`);
  }

  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  let count = 0;
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      count += copyDirectoryRecursive(srcPath, destPath);
    } else if (entry.name.toLowerCase().endsWith('.svg')) {
      fs.copyFileSync(srcPath, destPath);
      count++;
    }
  }

  return count;
}

function getPackageVersion() {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(PACKAGE_ROOT, 'package.json'), 'utf8'));
    return pkg.version || '1.0.0';
  } catch {
    return '1.0.0';
  }
}

async function runInit(options) {
  printBanner();

  let prefix = options.prefix;
  let tag = options.tag;
  let assetsPath = options.assets;
  let initFilePath = options.initFile;

  const isInteractive = !options.yes && process.stdin.isTTY;

  if (isInteractive) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log(`${c.bright}Vamos configurar a biblioteca White-Label para o seu projeto:${c.reset}\n`);

    if (!prefix) {
      prefix = await askQuestion(rl, '1. Qual prefixo de classe deseja usar para os ícones? (ex: empresa, app, wl)', 'wl');
    }

    if (!tag) {
      const defaultTag = `${prefix}-icone`;
      tag = await askQuestion(rl, `2. Qual tag Web Component deseja registrar?`, defaultTag);
    }

    if (!assetsPath) {
      assetsPath = await askQuestion(rl, '3. Onde deseja copiar os arquivos SVG no seu projeto?', 'src/assets/icones');
    }

    if (!initFilePath) {
      const isTs = fs.existsSync(path.resolve(process.cwd(), 'tsconfig.json'));
      const defaultInit = isTs ? 'src/icons-init.ts' : 'src/icons-init.js';
      initFilePath = await askQuestion(rl, '4. Caminho para o arquivo de inicialização:', defaultInit);
    }

    rl.close();
    console.log('');
  } else {
    // Defaults para modo não-interativo ou com flags parciais
    prefix = prefix || 'wl';
    tag = tag || `${prefix}-icone`;
    assetsPath = assetsPath || 'src/assets/icones';
    if (!initFilePath) {
      const isTs = fs.existsSync(path.resolve(process.cwd(), 'tsconfig.json'));
      initFilePath = isTs ? 'src/icons-init.ts' : 'src/icons-init.js';
    }
  }

  // Normalização
  prefix = prefix.toLowerCase().replace(/[^a-z0-9_-]/g, '');
  if (!tag.includes('-')) {
    tag = `${tag}-icone`;
  }

  const targetAssetsDir = path.resolve(process.cwd(), assetsPath);
  const targetInitFile = path.resolve(process.cwd(), initFilePath);

  console.log(`${c.cyan}⚙️  Configurações selecionadas:${c.reset}`);
  console.log(`   • Prefixo CSS:        ${c.green}${prefix}${c.reset}  (ex: <i class="${prefix}-bx-user"></i>)`);
  console.log(`   • Tag Web Component:  ${c.green}<${tag}>${c.reset}  (ex: <${tag} nome="bx-user"></${tag}>)`);
  console.log(`   • Pasta de SVGs:      ${c.green}${assetsPath}${c.reset}`);
  console.log(`   • Arquivo de Init:    ${c.green}${initFilePath}${c.reset}\n`);

  // 1. Cópia de SVGs
  console.log(`${c.bright}📦 Copiando ícones SVG para "${assetsPath}"...${c.reset}`);
  try {
    const copiedCount = copyDirectoryRecursive(SOURCE_ICONS_DIR, targetAssetsDir);
    console.log(`${c.green}✔ ${copiedCount} ícones SVG copiados com sucesso!${c.reset}\n`);
  } catch (err) {
    console.error(`${c.red}❌ Falha ao copiar ícones:${c.reset}`, err.message);
    process.exit(1);
  }

  // 2. Criação do arquivo de inicialização
  console.log(`${c.bright}📝 Gerando arquivo de inicialização em "${initFilePath}"...${c.reset}`);
  
  // Calcula o basePath web relativo esperado pelo navegador
  let webBasePath = assetsPath.replace(/^src\//, '').replace(/^public\//, '');
  if (!webBasePath.startsWith('/')) webBasePath = '/' + webBasePath;
  if (!webBasePath.endsWith('/')) webBasePath += '/';

  const isTypeScript = initFilePath.endsWith('.ts');
  const code = `/**
 * Configuração dos Ícones White-Label
 * Gerado automaticamente pelo CLI @erikbernard/white-label-icons
 */
import { configureIcons } from '@erikbernard/white-label-icons';

export function initAppIcons()${isTypeScript ? ': void' : ''} {
  configureIcons({
    prefix: '${prefix}',
    tagName: '${tag}',
    basePath: '${webBasePath}',
    autoReplace: true,
  });
}

// Inicializa automaticamente no navegador
if (typeof window !== 'undefined') {
  initAppIcons();
}
`;

  try {
    fs.mkdirSync(path.dirname(targetInitFile), { recursive: true });
    fs.writeFileSync(targetInitFile, code, 'utf8');
    console.log(`${c.green}✔ Arquivo "${initFilePath}" criado com sucesso!${c.reset}\n`);
  } catch (err) {
    console.error(`${c.red}❌ Falha ao criar arquivo de inicialização:${c.reset}`, err.message);
  }

  // 3. Verificação de angular.json
  const angularJsonPath = path.resolve(process.cwd(), 'angular.json');
  if (fs.existsSync(angularJsonPath)) {
    console.log(`${c.magenta}💡 Projeto Angular detectado!${c.reset}`);
    console.log(`   Certifique-se de que a pasta "${assetsPath}" está incluída em "assets" no seu ${c.yellow}angular.json${c.reset}:`);
    console.log(`   ${c.bright}"assets": ["src/favicon.ico", "src/assets", "${assetsPath}"]${c.reset}\n`);
  }

  // 4. Instruções de Uso
  console.log(`${c.cyan}${c.bright}🚀 Pronto! Como utilizar no seu projeto:${c.reset}`);
  console.log(`\n1. Importe o arquivo gerado no seu ponto de entrada (ex: ${c.yellow}src/main.ts${c.reset} ou ${c.yellow}src/index.js${c.reset}):`);
  console.log(`   ${c.green}import './${path.relative(path.dirname(path.resolve(process.cwd(), 'src/main.ts')), targetInitFile).replace(/\\/g, '/').replace(/\.ts$/, '')}';${c.reset}`);

  console.log(`\n2. Use as tags no seu HTML / Templates:`);
  console.log(`   ${c.green}<${tag} nome="bx-user" tamanho="24" cor="#3b82f6"></${tag}>${c.reset}`);
  console.log(`   ${c.bright}ou simplesmente via classe CSS:${c.reset}`);
  console.log(`   ${c.green}<i class="${prefix}-bx-user"></i>${c.reset}\n`);
}

async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  if (options.version) {
    console.log(`v${getPackageVersion()}`);
    process.exit(0);
  }

  if (options.help) {
    printHelp();
    process.exit(0);
  }

  await runInit(options);
}

main().catch((err) => {
  console.error(`${c.red}Erro inesperado:${c.reset}`, err);
  process.exit(1);
});
