# @erikbernardo/white-label-icons 🎨

Biblioteca de ícones moderna, ultraleve, **100% White-Label** e agnóstica a frameworks. 

Permite que **qualquer empresa ou projeto** utilize sua própria identidade de tags (`<empresa-icone>` ou `<meuapp-icon>`), classes CSS (`<i class="empresa-bx-user"></i>`) e diretórios de assets com zero acoplamento de marca e máxima performance com carregamento sob demanda (Lazy Loading e In-Memory Caching).

🌐 **Demonstração & Catálogo Oficial**: [https://erikbernard.github.io/white-label-icons/](https://erikbernard.github.io/white-label-icons/)

---

## ⚡ Início Rápido com CLI (Recomendado)

O pacote inclui uma ferramenta CLI poderosa para configurar seu projeto em segundos (copiando os 6.919 SVGs para a pasta de assets do seu projeto e gerando os arquivos de inicialização específicos para cada framework).

### 🌟 Como funciona o `init`:

Execute no terminal do seu projeto:

```bash
npx @erikbernardo/white-label-icons init
# ou
npx wl-icons init
```

O CLI detecta automaticamente o ambiente do projeto ou exibe o menu interativo:

```text
1. Selecione o ambiente / framework do projeto:
   [1] Angular 8 a 18 (NgModules / AppModule clássico)
   [2] Angular 19 / 20+ (Standalone APIs / app.config.ts)
   [3] React / Next.js / Vite
   [4] Vue 2 / Vue 3 / Nuxt
   [5] JavaScript Puro / Vanilla HTML
```

---

### ⚡ Modo Direto (com Flags)

Você também pode rodar diretamente especificando o framework e prefixos sem perguntas interativas:

```bash
# Angular 19 / 20+ (Standalone)
npx wl-icons init -f angular --prefix=minhaempresa -y

# React / Next.js / Vite
npx wl-icons init -f react --prefix=app -y

# Angular 8 a 18 (NgModule)
npx wl-icons init -f angular-legacy --prefix=empresa -y

# Vue 2 / Vue 3
npx wl-icons init -f vue --prefix=meuapp -y
```

#### Opções e Flags do CLI:
| Flag | Descrição | Opções / Padrão |
| :--- | :--- | :--- |
| `-f, --framework <tipo>` | Framework do seu projeto | `angular-legacy` (8-18), `angular` (19/20+), `react`, `vue`, `vanilla` |
| `-p, --prefix <valor>` | Prefixo das classes CSS (`<i class="{prefix}-user">`) | `wl` |
| `-t, --tag <valor>` | Nome da tag Web Component | `{prefix}-icone` |
| `-a, --assets <pasta>` | Pasta onde os 6.919 SVGs serão copiados | Auto-detectado por framework |
| `-i, --init-file <caminho>` | Arquivo customizado gerado para o framework | Auto-detectado por framework |
| `-y, --yes` | Pular perguntas e usar detecção automática | `false` |

---

## 📦 Instalação Manual via NPM

```bash
npm install @erikbernardo/white-label-icons
```

---

## 🚀 Integração por Framework

### 1. Angular 19 e 20+ (Standalone APIs / `app.config.ts`)

O CLI gera automaticamente o `src/app/icons.config.ts`. Adicione o provider no seu `src/app/app.config.ts`:

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideWhiteLabelIcons } from './icons.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideWhiteLabelIcons()
  ]
};
```

No template HTML dos seus componentes:
```html
<empresa-icone nome="bx-user" tamanho="24" cor="#3b82f6"></empresa-icone>
<i class="empresa-bx-user"></i>
```

---

### 2. Angular 8 a 18 (NgModules / `AppModule` Clássico)

O CLI gera o `src/app/icons.module.ts` já com `CUSTOM_ELEMENTS_SCHEMA` e inicialização no boot. Basta importar no seu `src/app/app.module.ts`:

```typescript
import { NgModule } from '@angular/core';
import { IconsModule } from './icons.module';

@NgModule({
  imports: [
    IconsModule,
    // ...
  ]
})
export class AppModule {}
```

#### Passo 2: Utilização nos Templates HTML

```html
<!-- Opção A: Via Custom Element Nativo -->
<empresa-icone nome="bx-user" tamanho="24" cor="#3b82f6"></empresa-icone>

<!-- Opção B: Via Classe CSS (Auto-replace) -->
<i class="empresa-bx-user" tamanho="32" cor="#10b981"></i>
<i class="empresa-bx-car-bolt" rotacao="45"></i>
<i class="empresa-bx-door-open-alt" espelhar="horizontal"></i>
```

---

### 2. React / Next.js / Vue / Vite

No ponto de entrada da aplicação (ex: `index.js`, `main.ts`, `App.tsx`):

```javascript
import { configureIcons } from '@erikbernardo/white-label-icons';

configureIcons({
  prefix: 'app',
  basePath: '/icones/'
});
```

No JSX / HTML:
```jsx
export function Header() {
  return (
    <nav>
      <i className="app-bx-cart-check" tamanho="28" cor="#3b82f6" />
      <span>Meu Carrinho</span>
    </nav>
  );
}
```

---

### 3. Vanilla JS / HTML Puro

```html
<!-- Importação direta via script module -->
<script type="module">
  import { configureIcons } from './node_modules/@erikbernardo/white-label-icons/index.js';
  
  configureIcons({
    prefix: 'meuapp',
    tagName: 'meuapp-icone',
    basePath: './icones/'
  });
</script>

<meuapp-icone nome="bx-bell" tamanho="32"></meuapp-icone>
<i class="meuapp-bx-user"></i>
```

---

## ⚙️ Atributos e Customizações Suportadas

O componente e as tags `<i>` suportam atributos bilíngues (pt-BR e en-US):

| Atributo (pt / en) | Tipo | Exemplo | Descrição |
| :--- | :--- | :--- | :--- |
| `nome` / `name` | `string` | `nome="bx-user"` | Identificador do ícone SVG. |
| `tamanho` / `size` | `number \| string` | `tamanho="32"` | Altura e largura em pixels (default: `24`). |
| `cor` / `color` | `string` | `cor="#ef4444"` | Cor do ícone (herda `currentColor` do CSS por padrão). |
| `rotacao` / `rotate` | `number \| string` | `rotacao="90"` | Rotação em graus (`0`, `45`, `90`, `180`, etc.). |
| `espelhar` / `flip` | `string` | `espelhar="horizontal"` | `horizontal` (X), `vertical` (Y) ou `ambos` (XY). |

---

## 🛠️ API em JavaScript / TypeScript

```typescript
import { 
  configureIcons, 
  getIconsConfig, 
  setIconsPath, 
  IconRegistry, 
  registerIcons, 
  replaceIcons, 
  initAutoReplace 
} from '@erikbernardo/white-label-icons';
```

### `configureIcons(options: IconOptions)`
Altera as configurações dinâmicas de prefixo, tag e caminhos em tempo de execução.

### `IconRegistry.define(name: string, svgContent: string)`
Permite registrar ícones embutidos diretamente no JavaScript (evitando requisições HTTP).

---

## 💻 Desenvolvimento & Catálogo Local

Para visualizar a galeria interativa de ícones e testar a troca de prefixos em tempo real:

```bash
# Compilar registro de ícones
npm run build:icons

# Iniciar servidor local
npm run dev
```

---

## 📄 Licença

Distribuído sob a licença [MIT](LICENSE). Desenvolvido por [Erik Bernard](https://github.com/erikbernard).
