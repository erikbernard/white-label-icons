/**
 * White Label Icons - Módulo Core (Web Components & Auto-replace)
 * Biblioteca de ícones agnóstica de framework, otimizada para Angular (8-20+), React, Vue e Web em geral.
 */

// Estado de Configuração Global
const config = {
  prefix: 'wl',
  tagName: 'wl-icone',
  basePath: './icones/',
  autoReplace: true,
};

// Caches de Alta Performance (Lazy Loading & Request Pooling)
export const IconCache = new Map(); // Guarda a string SVG já resolvida (In-Memory Cache)
const RequestPool = new Map(); // Guarda as Promises de download em curso (Deduplicação de HTTP)
const registeredTags = new Set();

/**
 * Define ou atualiza as configurações globais da biblioteca de ícones.
 * @param {Object} options
 * @param {string} [options.prefix='wl'] Prefixo das classes CSS (ex: 'empresa' para <i class="empresa-bx-user">)
 * @param {string} [options.tagName] Nome da tag Web Component (padrão: '${prefix}-icone')
 * @param {string} [options.basePath='./icones/'] Caminho onde os arquivos SVG estão hospedados
 * @param {boolean} [options.autoReplace=true] Ativa/desativa o auto-replace de tags <i> com MutationObserver
 */
export function configureIcons(options = {}) {
  if (options.prefix) {
    config.prefix = options.prefix.trim().toLowerCase();
  }

  if (options.tagName) {
    let tag = options.tagName.trim().toLowerCase();
    if (!tag.includes('-')) tag = `${tag}-icone`;
    config.tagName = tag;
  } else if (options.prefix) {
    config.tagName = `${config.prefix}-icone`;
  }

  if (options.basePath !== undefined) {
    let path = options.basePath.trim();
    if (path && !path.endsWith('/')) path += '/';
    config.basePath = path;
  }

  if (options.autoReplace !== undefined) {
    config.autoReplace = Boolean(options.autoReplace);
  }

  // Registra o Custom Element se ainda não registrado
  registerCustomElement(config.tagName);

  // Executa o auto-replace com as novas configurações se estiver no browser
  if (typeof document !== 'undefined' && config.autoReplace) {
    replaceIcons();
    initAutoReplace();
  }

  return { ...config };
}

/**
 * Retorna as configurações atuais.
 */
export function getIconsConfig() {
  return { ...config };
}

/**
 * Define o caminho base onde os ficheiros SVG estão hospedados.
 * Num projeto Angular, habitualmente '/assets/icones/' ou 'assets/icones/'.
 * @param {string} path O caminho relativo ou absoluto para a pasta de ícones
 */
export function setIconsPath(path) {
  configureIcons({ basePath: path });
}

// 1. Registro Opcional de Ícones (Para preload estático ou bundles embutidos)
export class IconRegistry {
  static define(name, svgContent) {
    const normalized = name.toLowerCase();
    IconCache.set(normalized, svgContent);
    if (typeof document !== 'undefined') {
      const elements = document.querySelectorAll(`${config.tagName}[nome="${normalized}"], ${config.tagName}[name="${normalized}"]`);
      elements.forEach(el => {
        if (typeof el.render === 'function') el.render();
      });
    }
  }

  static get(name) {
    if (!name) return undefined;
    return IconCache.get(name.toLowerCase());
  }

  static has(name) {
    if (!name) return false;
    return IconCache.has(name.toLowerCase());
  }
}

export function registerIcons(iconsObj) {
  for (const [name, svg] of Object.entries(iconsObj)) {
    IconRegistry.define(name, svg);
  }
}

/**
 * Classe Web Component para renderização dos ícones SVG.
 */
export class WhiteLabelIcon extends HTMLElement {
  static get observedAttributes() {
    return [
      'nome', 'name',
      'tamanho', 'size',
      'cor', 'color',
      'rotacao', 'rotate',
      'espelhar', 'flip'
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.observer = null;
    this.isVisible = false;
  }

  connectedCallback() {
    this.setupObserver();
  }

  disconnectedCallback() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  getIconName() {
    return this.getAttribute('nome') || this.getAttribute('name') || '';
  }

  getSize() {
    return this.getAttribute('tamanho') || this.getAttribute('size') || '24';
  }

  getColor() {
    return this.getAttribute('cor') || this.getAttribute('color') || '';
  }

  getRotate() {
    return this.getAttribute('rotacao') || this.getAttribute('rotate') || '';
  }

  getFlip() {
    return this.getAttribute('espelhar') || this.getAttribute('flip') || '';
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      if (name === 'nome' || name === 'name') {
        if (this.isVisible) this.loadAndRender();
      } else {
        const iconName = this.getIconName();
        if (this.isVisible || (iconName && IconCache.has(iconName.toLowerCase()))) {
          if (this.shadowRoot && this.shadowRoot.querySelector('svg')) {
            this.updateStyles();
          } else {
            this.render();
          }
        }
      }
    }
  }

  setupObserver() {
    if (typeof IntersectionObserver !== 'undefined') {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.isVisible = true;
            this.loadAndRender();
            if (this.observer) {
              this.observer.disconnect();
              this.observer = null;
            }
          }
        });
      }, { rootMargin: '50px' });
      this.observer.observe(this);
    } else {
      this.isVisible = true;
      this.loadAndRender();
    }
  }

  async loadAndRender() {
    const rawName = this.getIconName();
    if (!rawName) {
      this.shadowRoot.innerHTML = '';
      return;
    }

    const normalizedName = rawName.toLowerCase();

    if (IconCache.has(normalizedName)) {
      this.render();
      return;
    }

    const tamanho = this.getSize();
    if (!this.shadowRoot.querySelector('svg')) {
      this.shadowRoot.innerHTML = `<span style="display: inline-block; width: ${tamanho}px; height: ${tamanho}px;"></span>`;
    }

    let fetchPromise = RequestPool.get(normalizedName);
    if (!fetchPromise) {
      const url = `${config.basePath}${normalizedName}.svg`;
      fetchPromise = fetch(url)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.text();
        })
        .then(svgText => {
          IconCache.set(normalizedName, svgText);
          RequestPool.delete(normalizedName);
          return svgText;
        })
        .catch(err => {
          console.warn(`[White-Label Icons] Falha ao carregar ícone "${normalizedName}" de "${url}":`, err);
          RequestPool.delete(normalizedName);
          return null;
        });

      RequestPool.set(normalizedName, fetchPromise);
    }

    const svgContent = await fetchPromise;
    if (svgContent) {
      const currentName = this.getIconName();
      if (currentName && currentName.toLowerCase() === normalizedName) {
        this.render();
      }
    }
  }

  render() {
    const rawName = this.getIconName();
    if (!rawName) return;

    const svgRaw = IconCache.get(rawName.toLowerCase());
    if (!svgRaw) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(svgRaw, 'image/svg+xml');
    const svgEl = doc.querySelector('svg');

    if (!svgEl) {
      this.shadowRoot.innerHTML = '';
      return;
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          vertical-align: middle;
          width: var(--icon-size, 24px);
          height: var(--icon-size, 24px);
          line-height: 1;
        }
        svg {
          display: block;
          width: 100%;
          height: 100%;
          fill: currentColor;
          color: var(--icon-color, inherit);
          transform: var(--icon-transform, none);
          transform-origin: center;
          transition: var(--icon-transition, transform 0.2s ease, color 0.2s ease);
        }
      </style>
    `;
    this.shadowRoot.appendChild(svgEl);
    this.updateStyles();
  }

  updateStyles() {
    const tamanho = this.getSize();
    const cor = this.getColor();
    const rotacao = this.getRotate();
    const espelhar = this.getFlip();

    this.style.setProperty('--icon-size', `${tamanho}px`);

    if (cor) {
      this.style.setProperty('--icon-color', cor);
    } else {
      this.style.removeProperty('--icon-color');
    }

    let transform = '';
    if (rotacao) {
      const degrees = parseInt(rotacao, 10);
      if (!isNaN(degrees)) {
        transform += `rotate(${degrees}deg) `;
      }
    }

    if (espelhar) {
      const val = espelhar.toLowerCase();
      if (val === 'horizontal' || val === 'x') {
        transform += 'scaleX(-1) ';
      } else if (val === 'vertical' || val === 'y') {
        transform += 'scaleY(-1) ';
      } else if (val === 'ambos' || val === 'both' || val === 'xy') {
        transform += 'scale(-1) ';
      }
    }

    if (transform) {
      this.style.setProperty('--icon-transform', transform.trim());
    } else {
      this.style.removeProperty('--icon-transform');
    }
  }
}

/**
 * Registra o Web Component com o nome de tag fornecido (ex: 'wl-icone', 'empresa-icone').
 * Cria uma subclasse dinâmica para evitar erros de redefinição de construtor no customElements.define.
 * @param {string} tagName
 */
export function registerCustomElement(tagName) {
  if (typeof window === 'undefined' || !window.customElements) return;

  // Web components exigem pelo menos um hífen no nome da tag
  let normalizedTag = tagName.toLowerCase();
  if (!normalizedTag.includes('-')) {
    normalizedTag = `${normalizedTag}-icone`;
  }

  if (!customElements.get(normalizedTag)) {
    // Cria uma subclasse anônima distinta para satisfazer a especificação do DOM
    const DynamicCustomElement = class extends WhiteLabelIcon {};
    customElements.define(normalizedTag, DynamicCustomElement);
    registeredTags.add(normalizedTag);
  }
}

/**
 * Substitui elementos <i> com classes prefixadas (ex: <i class="wl-bx-user"></i>)
 * por instâncias do Custom Element correspondente.
 */
export function replaceIcons() {
  if (typeof document === 'undefined') return;

  const prefix = config.prefix;
  const prefixMatch = `${prefix}-`;
  const elements = document.querySelectorAll(`i[class*="${prefixMatch}"]`);

  elements.forEach(el => {
    const classes = Array.from(el.classList);
    const iconClass = classes.find(c => c.startsWith(prefixMatch) && c !== config.tagName);

    if (iconClass) {
      const iconName = iconClass.substring(prefixMatch.length);
      const iconElement = document.createElement(config.tagName);
      iconElement.setAttribute('nome', iconName);

      // Copia atributos suportados
      const attrs = ['tamanho', 'size', 'cor', 'color', 'rotacao', 'rotate', 'espelhar', 'flip'];
      attrs.forEach(attr => {
        if (el.hasAttribute(attr)) {
          iconElement.setAttribute(attr, el.getAttribute(attr));
        }
      });

      // Transfere classes extras
      classes.forEach(c => {
        if (c !== iconClass) {
          iconElement.classList.add(c);
        }
      });

      if (el.hasAttribute('style')) iconElement.setAttribute('style', el.getAttribute('style'));
      if (el.hasAttribute('id')) iconElement.setAttribute('id', el.getAttribute('id'));

      if (el.parentNode) {
        el.parentNode.replaceChild(iconElement, el);
      }
    }
  });
}

let autoReplaceObserver = null;
let replaceTimeout = null;

/**
 * Inicializa o observador de mutações para substituir tags <i> dinamicamente inseridas.
 */
export function initAutoReplace() {
  if (typeof document === 'undefined' || !config.autoReplace) return;

  replaceIcons();

  if (autoReplaceObserver) return;

  autoReplaceObserver = new MutationObserver((mutations) => {
    let hasNewNodes = false;
    for (let i = 0; i < mutations.length; i++) {
      if (mutations[i].addedNodes.length > 0) {
        hasNewNodes = true;
        break;
      }
    }

    if (hasNewNodes) {
      if (replaceTimeout) clearTimeout(replaceTimeout);
      replaceTimeout = setTimeout(() => {
        replaceIcons();
      }, 20);
    }
  });

  const targetNode = document.body || document.documentElement;
  if (targetNode) {
    autoReplaceObserver.observe(targetNode, {
      childList: true,
      subtree: true
    });
  }
}

// Auto-inicialização no navegador com os valores padrão
if (typeof window !== 'undefined') {
  registerCustomElement(config.tagName);

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        if (config.autoReplace) initAutoReplace();
      });
    } else {
      if (config.autoReplace) initAutoReplace();
    }
  }
}
