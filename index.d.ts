export interface IconOptions {
  /**
   * Prefixo das classes CSS dos ícones (ex: 'empresa' para `<i class="empresa-bx-user"></i>`).
   * @default 'wl'
   */
  prefix?: string;

  /**
   * Nome da tag Web Component personalizada.
   * Deve conter pelo menos um hífen (ex: 'empresa-icone', 'empresa-icon').
   * @default `${prefix}-icone`
   */
  tagName?: string;

  /**
   * Caminho base onde os arquivos SVG estão hospedados no servidor/projeto.
   * @default './icones/'
   */
  basePath?: string;

  /**
   * Ativa ou desativa a observação e substituição automática de tags `<i>` pelo MutationObserver.
   * @default true
   */
  autoReplace?: boolean;
}

export interface IconsConfig {
  prefix: string;
  tagName: string;
  basePath: string;
  autoReplace: boolean;
}

/**
 * Configura as opções globais da biblioteca de ícones White-Label.
 */
export function configureIcons(options?: IconOptions): IconsConfig;

/**
 * Retorna as configurações ativas atuais.
 */
export function getIconsConfig(): IconsConfig;

/**
 * Define o caminho base dos arquivos SVG (ex: '/assets/icones/').
 */
export function setIconsPath(path: string): void;

/**
 * Cache em memória dos conteúdos SVG.
 */
export const IconCache: Map<string, string>;

/**
 * Registrador estático de ícones SVG.
 */
export class IconRegistry {
  static define(name: string, svgContent: string): void;
  static get(name: string): string | undefined;
  static has(name: string): boolean;
}

/**
 * Registra múltiplos ícones de um objeto { [nome]: svgString }.
 */
export function registerIcons(iconsObj: Record<string, string>): void;

/**
 * Elemento Web Component WhiteLabelIcon para exibição de ícones SVG.
 */
export class WhiteLabelIcon extends HTMLElement {
  static readonly observedAttributes: string[];
}

/**
 * Registra o Custom Element no navegador.
 */
export function registerCustomElement(tagName: string): void;

/**
 * Executa uma varredura no DOM e substitui tags `<i>` com a classe de prefixo configurada pelo Custom Element.
 */
export function replaceIcons(): void;

/**
 * Inicia o MutationObserver para auto-replace em inserções dinâmicas de DOM.
 */
export function initAutoReplace(): void;
