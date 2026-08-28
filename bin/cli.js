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
  gray: '\x1b[90m',
};

function getPackageInfo() {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(PACKAGE_ROOT, 'package.json'), 'utf8'));
    return {
      name: pkg.name || '@erikbernardo/white-label-icons',
      version: pkg.version || '1.0.0',
    };
  } catch {
    return {
      name: '@erikbernardo/white-label-icons',
      version: '1.0.0',
    };
  }
}

const { name: PACKAGE_NAME, version: PACKAGE_VERSION } = getPackageInfo();

function printBanner() {
  console.log(`\n${c.cyan}${c.bright}======================================================${c.reset}`);
  console.log(`${c.magenta}${c.bright}    🎨 White-Label Icons CLI (${PACKAGE_NAME}) ${c.reset}`);
  console.log(`${c.cyan}${c.bright}======================================================${c.reset}\n`);
}

function printHelp() {
  printBanner();
  console.log(`Uso:
  ${c.green}npx ${PACKAGE_NAME} init${c.reset} [opções]
  ${c.green}npx wl-icons init${c.reset} [opções]

Opções:
  ${c.yellow}-f, --framework <tipo>${c.reset}   Ambiente do projeto:
                            ${c.bright}angular-legacy${c.reset} (Angular 8 a 18 - NgModule)
                            ${c.bright}angular${c.reset}        (Angular 19/20+ - Standalone)
                            ${c.bright}react${c.reset}          (React / Next.js / Vite)
                            ${c.bright}vue${c.reset}            (Vue 2 / Vue 3 / Nuxt)
                            ${c.bright}vanilla${c.reset}        (JavaScript Puro / HTML)
  ${c.yellow}-p, --prefix <valor>${c.reset}    Prefixo das classes CSS (ex: 'empresa' para <i class="empresa-bx-user">)
  ${c.yellow}-t, --tag <valor>${c.reset}       Nome da tag Web Component (ex: 'empresa-icone' ou 'empresa-icon')
  ${c.yellow}-b, --base-path <url>${c.reset}   Caminho público dos ícones (padrão: '/assets/icones/')
  ${c.yellow}-i, --init-file <caminho>${c.reset}Arquivo gerado de configuração para o framework
  ${c.yellow}-y, --yes${c.reset}               Aceitar todos os padrões detectados sem perguntas interativas
  ${c.yellow}--copy-svgs${c.reset}             Forçar a cópia física dos arquivos SVG (não necessário para Angular)
  ${c.yellow}-h, --help${c.reset}              Exibir esta ajuda
  ${c.yellow}-v, --version${c.reset}           Exibir a versão instalada
`);
}

function parseArgs(args) {
  const parsed = {
    command: 'init',
    framework: '',
    prefix: '',
    tag: '',
    basePath: '',
    initFile: '',
    yes: false,
    copySvgs: false,
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
    } else if (arg === '--copy-svgs') {
      parsed.copySvgs = true;
    } else if (arg.startsWith('--framework=')) {
      parsed.framework = arg.split('=')[1];
    } else if (arg === '-f' && args[i + 1]) {
      parsed.framework = args[++i];
    } else if (arg.startsWith('--prefix=')) {
      parsed.prefix = arg.split('=')[1];
    } else if (arg === '-p' && args[i + 1]) {
      parsed.prefix = args[++i];
    } else if (arg.startsWith('--tag=')) {
      parsed.tag = arg.split('=')[1];
    } else if (arg === '-t' && args[i + 1]) {
      parsed.tag = args[++i];
    } else if (arg.startsWith('--base-path=') || arg.startsWith('--assets=')) {
      parsed.basePath = arg.split('=')[1];
    } else if ((arg === '-b' || arg === '-a') && args[i + 1]) {
      parsed.basePath = args[++i];
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

/**
 * Detecta o ambiente do projeto no diretório atual.
 */
function detectEnvironment() {
  const cwd = process.cwd();
  let pkg = {};
  try {
    const pkgPath = path.join(cwd, 'package.json');
    if (fs.existsSync(pkgPath)) {
      pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    }
  } catch {}

  const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };

  // Angular
  if (fs.existsSync(path.join(cwd, 'angular.json')) || deps['@angular/core']) {
    if (fs.existsSync(path.join(cwd, 'src/app/app.config.ts')) || (deps['@angular/core'] && deps['@angular/core'].match(/(\^|~)?(19|20|[2-9][0-9])/))) {
      return 'angular'; // Standalone
    }
    return 'angular-legacy'; // NgModule (Angular 8-18)
  }

  // React
  if (deps['react'] || deps['next'] || fs.existsSync(path.join(cwd, 'next.config.js')) || fs.existsSync(path.join(cwd, 'next.config.mjs'))) {
    return 'react';
  }

  // Vue
  if (deps['vue'] || deps['nuxt'] || fs.existsSync(path.join(cwd, 'nuxt.config.ts'))) {
    return 'vue';
  }

  return 'vanilla';
}

function normalizeFramework(fw) {
  if (!fw) return '';
  const val = fw.toLowerCase().trim();
  if (val === '1' || val === 'angular-legacy' || val === 'angular8' || val === 'angular-8' || val === 'angular-18' || val === 'ngmodule') {
    return 'angular-legacy';
  }
  if (val === '2' || val === 'angular' || val === 'angular-standalone' || val === 'angular19' || val === 'angular20' || val === 'angular-19' || val === 'angular-20') {
    return 'angular';
  }
  if (val === '3' || val === 'react' || val === 'next' || val === 'nextjs') {
    return 'react';
  }
  if (val === '4' || val === 'vue' || val === 'vue3' || val === 'vue2' || val === 'nuxt') {
    return 'vue';
  }
  if (val === '5' || val === 'vanilla' || val === 'js' || val === 'html') {
    return 'vanilla';
  }
  return 'vanilla';
}

function getFrameworkLabel(fw) {
  switch (fw) {
    case 'angular-legacy': return 'Angular 8 a 18 (NgModules / AppModule)';
    case 'angular': return 'Angular 19 / 20+ (Standalone APIs / app.config.ts)';
    case 'react': return 'React / Next.js / Vite';
    case 'vue': return 'Vue 2 / Vue 3 / Nuxt';
    default: return 'JavaScript Puro / Vanilla HTML';
  }
}

function getDefaultPathsForFramework(fw, isTs) {
  let defaultBasePath = '/assets/icones/';
  let defaultInitFile = isTs ? 'src/icons-init.ts' : 'src/icons-init.js';

  switch (fw) {
    case 'angular-legacy':
      defaultBasePath = '/assets/icones/';
      defaultInitFile = isTs ? 'src/app/icons.module.ts' : 'src/app/icons.module.js';
      break;

    case 'angular':
      defaultBasePath = '/assets/icones/';
      defaultInitFile = 'src/app/icons.config.ts';
      break;

    case 'react':
      defaultBasePath = '/icones/';
      defaultInitFile = isTs ? 'src/icons.tsx' : 'src/icons.jsx';
      break;

    case 'vue':
      defaultBasePath = '/icones/';
      defaultInitFile = isTs ? 'src/plugins/icons.ts' : 'src/plugins/icons.js';
      break;

    default: // vanilla
      defaultBasePath = './icones/';
      defaultInitFile = isTs ? 'src/icons-init.ts' : 'icons-init.js';
      break;
  }

  return { defaultBasePath, defaultInitFile };
}

/**
 * Atualiza o angular.json automaticamente para mapear os SVGs do node_modules
 */
function configureAngularJson(basePath) {
  const angularJsonPath = path.resolve(process.cwd(), 'angular.json');

  if (!fs.existsSync(angularJsonPath)) {
    return { success: false, reason: 'angular.json não encontrado' };
  }

  try {
    const rawContent = fs.readFileSync(angularJsonPath, 'utf8');
    const angularJson = JSON.parse(rawContent);
    const projects = angularJson.projects || {};
    let modified = false;

    // Normaliza o caminho de saída (ex: '/assets/icones/' -> '/assets/icones/')
    let outputDir = basePath;
    if (!outputDir.startsWith('/')) outputDir = '/' + outputDir;
    if (!outputDir.endsWith('/')) outputDir += '/';

    const assetEntry = {
      glob: '**/*.svg',
      input: `node_modules/${PACKAGE_NAME}/icones`,
      output: outputDir,
    };

    for (const [projectName, projectConfig] of Object.entries(projects)) {
      const architect = projectConfig.architect || projectConfig.targets || {};

      // 1. Configura no target "build"
      if (architect.build && architect.build.options) {
        if (!Array.isArray(architect.build.options.assets)) {
          architect.build.options.assets = [];
        }
        const assets = architect.build.options.assets;
        const exists = assets.some(
          (a) => typeof a === 'object' && a.input && (a.input.includes(PACKAGE_NAME) || a.input.includes('white-label-icons') || a.input.includes('gt-controller-icones'))
        );

        if (!exists) {
          assets.push(assetEntry);
          modified = true;
        }
      }

      // 2. Configura no target "test"
      if (architect.test && architect.test.options) {
        if (!Array.isArray(architect.test.options.assets)) {
          architect.test.options.assets = [];
        }
        const assets = architect.test.options.assets;
        const exists = assets.some(
          (a) => typeof a === 'object' && a.input && (a.input.includes(PACKAGE_NAME) || a.input.includes('white-label-icons') || a.input.includes('gt-controller-icones'))
        );

        if (!exists) {
          assets.push(assetEntry);
          modified = true;
        }
      }
    }

    if (modified) {
      fs.writeFileSync(angularJsonPath, JSON.stringify(angularJson, null, 2), 'utf8');
      return { success: true, modified: true };
    }

    return { success: true, modified: false };
  } catch (err) {
    return { success: false, reason: err.message };
  }
}

/**
 * Gera o código do arquivo de inicialização de acordo com o framework escolhido.
 */
function generateInitFileContent(framework, prefix, tag, webBasePath, isTs) {
  switch (framework) {
    case 'angular-legacy':
      return `/**
 * Módulo de Ícones White-Label para Angular 8 a 18 (NgModule)
 * Gerado automaticamente pelo CLI ${PACKAGE_NAME}
 */
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, APP_INITIALIZER } from '@angular/core';
import { configureIcons } from '${PACKAGE_NAME}';

export function initializeWhiteLabelIcons() {
  return () => {
    configureIcons({
      prefix: '${prefix}',
      tagName: '${tag}',
      basePath: '${webBasePath}',
      autoReplace: true,
    });
  };
}

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeWhiteLabelIcons,
      multi: true,
    },
  ],
})
export class IconsModule {}
`;

    case 'angular':
      return `/**
 * Provider de Ícones White-Label para Angular 19 e 20+ (Standalone APIs)
 * Gerado automaticamente pelo CLI ${PACKAGE_NAME}
 */
import { EnvironmentProviders, makeEnvironmentProviders, ENVIRONMENT_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { configureIcons, IconOptions } from '${PACKAGE_NAME}';

/**
 * Adicione este provider no seu app.config.ts:
 * export const appConfig: ApplicationConfig = {
 *   providers: [provideWhiteLabelIcons(), ...]
 * };
 */
export function provideWhiteLabelIcons(options?: Partial<IconOptions>): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: ENVIRONMENT_INITIALIZER,
      useValue: () => {
        configureIcons({
          prefix: '${prefix}',
          tagName: '${tag}',
          basePath: '${webBasePath}',
          autoReplace: true,
          ...options,
        });
      },
      multi: true,
    },
  ]);
}

// Schemas para componentes standalone que usam a tag <${tag}>
export const ICONS_SCHEMAS = [CUSTOM_ELEMENTS_SCHEMA];
`;

    case 'react':
      return `/**
 * Wrapper de Ícones White-Label para React / Next.js
 * Gerado automaticamente pelo CLI ${PACKAGE_NAME}
 */
import React from 'react';
import { configureIcons } from '${PACKAGE_NAME}';

// Inicializa no cliente
export function initIcons(): void {
  configureIcons({
    prefix: '${prefix}',
    tagName: '${tag}',
    basePath: '${webBasePath}',
    autoReplace: true,
  });
}

if (typeof window !== 'undefined') {
  initIcons();
}

export interface IconProps extends React.HTMLAttributes<HTMLElement> {
  name: string;
  size?: number | string;
  color?: string;
  rotate?: number | string;
  flip?: 'horizontal' | 'vertical' | 'ambos';
}

/**
 * Componente React reutilizável para ícones
 * Exemplo: <Icon name="bx-user" size={24} color="#3b82f6" />
 */
export const Icon: React.FC<IconProps> = ({ name, size, color, rotate, flip, className, ...props }) => {
  return React.createElement('${tag}', {
    nome: name,
    tamanho: size,
    cor: color,
    rotacao: rotate,
    espelhar: flip,
    class: className,
    ...props,
  });
};
`;

    case 'vue':
      return `/**
 * Plugin de Ícones White-Label para Vue 2 / Vue 3
 * Gerado automaticamente pelo CLI ${PACKAGE_NAME}
 */
import { configureIcons } from '${PACKAGE_NAME}';

export const IconsPlugin = {
  install(${isTs ? 'app: any' : 'app'}) {
    configureIcons({
      prefix: '${prefix}',
      tagName: '${tag}',
      basePath: '${webBasePath}',
      autoReplace: true,
    });
  },
};

// Auto-inicializa se estiver no navegador
if (typeof window !== 'undefined') {
  configureIcons({
    prefix: '${prefix}',
    tagName: '${tag}',
    basePath: '${webBasePath}',
    autoReplace: true,
  });
}
`;

    default: // vanilla
      return `/**
 * Configuração dos Ícones White-Label (JavaScript Puro / HTML)
 * Gerado automaticamente pelo CLI ${PACKAGE_NAME}
 */
import { configureIcons } from '${PACKAGE_NAME}';

export function initAppIcons()${isTs ? ': void' : ''} {
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
  }
}

async function runInit(options) {
  printBanner();

  const isTs = fs.existsSync(path.resolve(process.cwd(), 'tsconfig.json'));
  const detectedFw = detectEnvironment();

  let framework = normalizeFramework(options.framework);
  let prefix = options.prefix;
  let tag = options.tag;
  let basePath = options.basePath;
  let initFilePath = options.initFile;

  const isInteractive = !options.yes && process.stdin.isTTY;

  if (isInteractive) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log(`${c.bright}Vamos configurar a biblioteca White-Label de acordo com o seu ambiente:${c.reset}\n`);

    if (!framework) {
      console.log(`${c.cyan}1. Selecione o ambiente / framework do projeto:${c.reset}`);
      console.log(`   ${c.yellow}[1]${c.reset} Angular 8 a 18 (NgModules / AppModule clássico)`);
      console.log(`   ${c.yellow}[2]${c.reset} Angular 19 / 20+ (Standalone APIs / app.config.ts)`);
      console.log(`   ${c.yellow}[3]${c.reset} React / Next.js / Vite`);
      console.log(`   ${c.yellow}[4]${c.reset} Vue 2 / Vue 3 / Nuxt`);
      console.log(`   ${c.yellow}[5]${c.reset} JavaScript Puro / Vanilla HTML\n`);

      const fwChoiceMap = {
        'angular-legacy': '1',
        'angular': '2',
        'react': '3',
        'vue': '4',
        'vanilla': '5',
      };
      const defaultChoice = fwChoiceMap[detectedFw] || '1';

      const answer = await askQuestion(rl, 'Digite o número correspondente', defaultChoice);
      framework = normalizeFramework(answer) || detectedFw;
    }

    const { defaultBasePath, defaultInitFile } = getDefaultPathsForFramework(framework, isTs);

    if (!prefix) {
      prefix = await askQuestion(rl, '2. Qual prefixo de classe deseja usar para os ícones? (ex: empresa, app, wl)', 'wl');
    }

    if (!tag) {
      const defaultTag = `${prefix}-icone`;
      tag = await askQuestion(rl, `3. Qual tag Web Component deseja registrar?`, defaultTag);
    }

    if (!basePath) {
      basePath = await askQuestion(rl, '4. Rota pública base dos ícones (URL):', defaultBasePath);
    }

    if (!initFilePath) {
      initFilePath = await askQuestion(rl, '5. Caminho para o arquivo de inicialização gerado:', defaultInitFile);
    }

    rl.close();
    console.log('');
  } else {
    // Modo não interativo
    framework = framework || detectedFw || 'vanilla';
    prefix = prefix || 'wl';
    tag = tag || `${prefix}-icone`;
    const { defaultBasePath, defaultInitFile } = getDefaultPathsForFramework(framework, isTs);
    basePath = basePath || defaultBasePath;
    initFilePath = initFilePath || defaultInitFile;
  }

  // Normalização
  prefix = prefix.toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'wl';
  if (!tag.includes('-')) {
    tag = `${tag}-icone`;
  }

  if (!basePath.startsWith('/') && !basePath.startsWith('./')) {
    basePath = '/' + basePath;
  }
  if (!basePath.endsWith('/')) {
    basePath += '/';
  }

  const targetInitFile = path.resolve(process.cwd(), initFilePath);

  console.log(`${c.cyan}⚙️  Configurações selecionadas:${c.reset}`);
  console.log(`   • Ambiente / Framework: ${c.green}${getFrameworkLabel(framework)}${c.reset}`);
  console.log(`   • Prefixo CSS:          ${c.green}${prefix}${c.reset}  (ex: <i class="${prefix}-bx-user"></i>)`);
  console.log(`   • Tag Web Component:    ${c.green}<${tag}>${c.reset}  (ex: <${tag} nome="bx-user"></${tag}>)`);
  console.log(`   • Rota de Assets (URL): ${c.green}${basePath}${c.reset}`);
  console.log(`   • Arquivo de Init:      ${c.green}${initFilePath}${c.reset}\n`);

  // 1. Configuração Automática do angular.json (se for projeto Angular)
  const isAngular = framework === 'angular' || framework === 'angular-legacy';
  if (isAngular) {
    console.log(`${c.bright}⚙️  Configurando mapeamento de assets no "angular.json"...${c.reset}`);
    const ngResult = configureAngularJson(basePath);
    if (ngResult.success) {
      if (ngResult.modified) {
        console.log(`${c.green}✔ "angular.json" atualizado com sucesso! (SVGs serão servidos direto do node_modules sem poluir o Git).${c.reset}\n`);
      } else {
        console.log(`${c.green}✔ "angular.json" já possuía a regra de assets configurada.${c.reset}\n`);
      }
    } else {
      console.warn(`${c.yellow}⚠️  Aviso: Não foi possível atualizar o angular.json automaticamente (${ngResult.reason}).${c.reset}`);
      console.warn(`   Certifique-se de adicionar a seguinte regra manualmente em "assets":`);
      console.warn(`   {\n     "glob": "**/*.svg",\n     "input": "node_modules/${PACKAGE_NAME}/icones",\n     "output": "${basePath}"\n   }\n`);
    }
  }

  // 2. Cópia opcional para projetos não-Angular ou com flag --copy-svgs
  if (options.copySvgs || (!isAngular && (framework === 'react' || framework === 'vue' || framework === 'vanilla'))) {
    const publicDir = fs.existsSync(path.join(process.cwd(), 'public'))
      ? path.join(process.cwd(), 'public/icones')
      : path.join(process.cwd(), 'icones');

    if (options.copySvgs) {
      console.log(`${c.bright}📦 Copiando arquivos SVG para "${publicDir}" (--copy-svgs)...${c.reset}`);
      try {
        const copied = copyDirectoryRecursive(SOURCE_ICONS_DIR, publicDir);
        console.log(`${c.green}✔ ${copied} ícones copiados para "${publicDir}".${c.reset}\n`);
      } catch (err) {
        console.warn(`${c.yellow}⚠️  Não foi possível copiar os ícones: ${err.message}${c.reset}\n`);
      }
    }
  }

  // 3. Criação do arquivo de inicialização específico do framework
  console.log(`${c.bright}📝 Gerando arquivo de inicialização para ${getFrameworkLabel(framework)}...${c.reset}`);
  const code = generateInitFileContent(framework, prefix, tag, basePath, isTs);

  try {
    fs.mkdirSync(path.dirname(targetInitFile), { recursive: true });
    fs.writeFileSync(targetInitFile, code, 'utf8');
    console.log(`${c.green}✔ Arquivo "${initFilePath}" criado com sucesso!${c.reset}\n`);
  } catch (err) {
    console.error(`${c.red}❌ Falha ao criar arquivo de inicialização:${c.reset}`, err.message);
  }

  // 4. Instruções Finais
  console.log(`${c.cyan}${c.bright}🚀 Tudo pronto! Como utilizar no seu projeto:${c.reset}\n`);

  if (framework === 'angular-legacy') {
    console.log(`1. Importe o ${c.yellow}IconsModule${c.reset} no seu ${c.yellow}src/app/app.module.ts${c.reset}:`);
    console.log(`   ${c.green}import { IconsModule } from './icons.module';${c.reset}`);
    console.log(`   ${c.green}@NgModule({ imports: [IconsModule, ...], ... })${c.reset}\n`);
  } else if (framework === 'angular') {
    console.log(`1. Adicione o provider no seu ${c.yellow}src/app/app.config.ts${c.reset}:`);
    console.log(`   ${c.green}import { provideWhiteLabelIcons } from './icons.config';${c.reset}`);
    console.log(`   ${c.green}export const appConfig: ApplicationConfig = { providers: [provideWhiteLabelIcons(), ...] };${c.reset}\n`);
    console.log(`2. Em componentes Standalone que usam a tag <${tag}>, inclua o schema:`);
    console.log(`   ${c.green}import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';${c.reset}`);
    console.log(`   ${c.green}@Component({ schemas: [CUSTOM_ELEMENTS_SCHEMA], ... })${c.reset}\n`);
  } else if (framework === 'react') {
    console.log(`1. Importe o componente no seu JSX/TSX:`);
    console.log(`   ${c.green}import { Icon } from './${path.basename(initFilePath, path.extname(initFilePath))}';${c.reset}`);
    console.log(`   ${c.green}<Icon name="bx-user" size={24} color="#3b82f6" />${c.reset}\n`);
  } else if (framework === 'vue') {
    console.log(`1. Registre o plugin no seu ${c.yellow}src/main.ts${c.reset} / ${c.yellow}src/main.js${c.reset}:`);
    console.log(`   ${c.green}import { IconsPlugin } from './plugins/icons';${c.reset}`);
    console.log(`   ${c.green}app.use(IconsPlugin);${c.reset}\n`);
  } else {
    console.log(`1. Importe o arquivo gerado no seu ponto de entrada (ex: ${c.yellow}index.html${c.reset} ou ${c.yellow}main.js${c.reset}):`);
    console.log(`   ${c.green}<script type="module" src="./${initFilePath}"></script>${c.reset}\n`);
  }

  console.log(`${c.bright}Uso nos Templates HTML:${c.reset}`);
  console.log(`   • Via Custom Element: ${c.green}<${tag} nome="bx-user" tamanho="24" cor="#3b82f6"></${tag}>${c.reset}`);
  console.log(`   • Via Classe CSS:     ${c.green}<i class="${prefix}-bx-user"></i>${c.reset}\n`);
}

async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  if (options.version) {
    console.log(`v${PACKAGE_VERSION}`);
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

