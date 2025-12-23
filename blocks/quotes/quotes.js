import { html, render } from 'https://esm.sh/lit-html';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * ===========================================================================
 * STANDARD BLOCK HELPERS
 * (Ideally, move these to a shared utility file if reused across blocks)
 * ===========================================================================
 */

/**
 * Extracts the actual content columns from a block row, handling the extra 
 * nesting that the Universal Editor sometimes adds.
 * @param {Element} row The raw DOM row from the block
 * @returns {Element[]} An array of column elements containing the content
 */
function getRowContent(row) {
  let cols = [...row.children];
  // Check for nested wrapper (UE behavior: Row -> Wrapper -> Columns)
  if (cols.length === 1 && cols[0].children.length > 1) {
    return [...cols[0].children];
  }
  return cols;
}

/**
 * ===========================================================================
 * BLOCK LOGIC
 * ===========================================================================
 */

/**
 * Extracts configuration (styles/options) from the block wrapper.
 * In EDS, "Classes" fields often map to the block's classList.
 * @param {Element} block 
 * @returns {Object} Config object
 */
function extractConfig(block) {
  return {
    className: [...block.classList].find(c => c.startsWith('bg-')) || ''
  };
}

/**
 * Extracts data from a single item row.
 * Maps DOM structure to a clean JS object.
 * @param {Element} row 
 * @returns {Object} Item data
 */
function extractItemData(row) {
  const [quoteCol, authorCol] = getRowContent(row);

  return {
    sourceRow: row, // Keep reference for instrumentation
    quote: quoteCol?.innerHTML || '',
    author: authorCol?.innerHTML || ''
  };
}

/**
 * Renders the template for the entire block.
 * @param {Object[]} items Array of item data
 * @param {Object} config Block configuration
 * @returns {TemplateResult} lit-html template
 */
function renderTemplate(items, config) {
  return html`
    <div class="quote-container ${config.className}">
      <div class="quotes-list">
        ${items.map((item, index) => html`
          <div class="quote-item-wrapper" data-index="${index}">
            <blockquote .innerHTML=${item.quote}></blockquote>
            ${item.author ? html`<cite>- <span .innerHTML=${item.author}></span></cite>` : ''}
          </div>
        `)}
      </div>
    </div>
  `;
}

/**
 * Applies Universal Editor instrumentation to the newly rendered items.
 * @param {Element} block The block element
 * @param {Object[]} items The data items containing sourceRow references
 */
function applyInstrumentation(block, items) {
  const newItems = block.querySelectorAll('.quote-item-wrapper');
  newItems.forEach((newItem) => {
    const index = newItem.dataset.index;
    const originalItem = items[index];
    if (originalItem) {
      moveInstrumentation(originalItem.sourceRow, newItem);
    }
  });
}

/**
 * Main Decorator Function
 * Standard Flow: Config -> Data -> Render -> Instrumentation
 */
export default function decorate(block) {
  // 1. Extract Config
  const config = extractConfig(block);

  // 2. Extract Data
  const items = [...block.children].map(extractItemData);

  // 3. Render
  const template = renderTemplate(items, config);
  block.replaceChildren();
  render(template, block);

  // 4. Apply Instrumentation
  applyInstrumentation(block, items);
}
