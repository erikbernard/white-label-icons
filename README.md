# @erikbernard/white-label-icons 🎨

Biblioteca de ícones moderna, ultraleve, **100% White-Label** e agnóstica a frameworks. 

Permite que **qualquer empresa ou projeto** utilize sua própria identidade de tags (`<empresa-icone>` ou `<meuapp-icon>`), classes CSS (`<i class="empresa-bx-user"></i>`) e diretórios de assets com zero acoplamento de marca e máxima performance com carregamento sob demanda (Lazy Loading e In-Memory Caching).

---

## ⚡ Início Rápido com CLI (Recomendado)

O pacote inclui uma ferramenta CLI para configurar seu projeto em segundos (copiando os SVGs para a pasta de assets do seu projeto e gerando o arquivo de inicialização).

### Modo Interativo (Perguntas no Terminal)
```bash
npx @erikbernard/white-label-icons init
# ou
npx wl-icons init
```

### Modo Direto (com Flags)
```bash
npx wl-icons init --prefix=empresa --tag=empresa-icone --assets=src/assets/icones -y
```

#### Opções do CLI:
| Flag | Descrição | Padrão |
| :--- | :--- | :--- |
| `-p, --prefix <valor>` | Prefixo das classes CSS (`<i class="{prefix}-user">`) | `wl` |
| `-t, --tag <valor>` | Nome da tag Web Component | `{prefix}-icone` |
| `-a, --assets <pasta>` | Pasta onde os SVGs serão copiados | `src/assets/icones` |
| `-i, --init-file <caminho>` | Arquivo de inicialização gerado | `src/icons-init.ts` |
| `-y, --yes` | Pular perguntas e usar padrões/flags | `false` |

---

## 📦 Instalação Manual via NPM

```bash
npm install @erikbernard/white-label-icons
```

---

## 🚀 Como Usar no seu Framework

### 1. Angular (Versões 8 a 20+)

#### Passo 1: Inicialização
No seu `src/main.ts` (ou `app.config.ts`):

```typescript
import { configureIcons } from '@erikbernard/white-label-icons';

configureIcons({
  prefix: 'empresa',             // Classes: <i class="empresa-bx-user">
  tagName: 'empresa-icone',       // Tag: <empresa-icone nome="bx-user">
  basePath: '/assets/icones/',    // Caminho onde os SVGs foram colocados
  autoReplace: true               // Converte automaticamente tags <i> no DOM
});
```

> **Dica Angular**: Adicione `CUSTOM_ELEMENTS_SCHEMA` no seu `AppModule` ou `@Component` se estiver usando a sintaxe de Custom Element (`<empresa-icone>`):
> ```typescript
> import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
> 
> @NgModule({
>   schemas: [CUSTOM_ELEMENTS_SCHEMA]
> })
> export class AppModule {}
> ```

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
import { configureIcons } from '@erikbernard/white-label-icons';

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
  import { configureIcons } from './node_modules/@erikbernard/white-label-icons/index.js';
  
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
} from '@erikbernard/white-label-icons';
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
