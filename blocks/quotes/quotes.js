import { html, render } from 'https://esm.sh/lit-html';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Helper to extract content columns from a DOM row.
 * Handles the variability in DOM structure between Document-based authoring (flat)
 * and Universal Editor previews (often nested in wrappers).
 */
function getRowContent(row) {
  let cols = [...row.children];
  // Check if the row has a single child that is also a container (Universal Editor wrapper)
  if (cols.length === 1 && cols[0].children.length > 1) {
    return [...cols[0].children];
  }
  return cols;
}

/**
 * Extracts configuration (block options/styles) from the block wrapper.
 */
function extractConfig(block) {
  return {
    className: [...block.classList].find(c => c.startsWith('bg-')) || ''
  };
}

/**
 * Transforms a raw DOM row into a clean data object.
 */
function extractItemData(row) {
  const [quoteCol, authorCol, descCol] = getRowContent(row);

  return {
    sourceRow: row, // Reference to the Row (Item) for selection
    quote: quoteCol?.innerHTML || '',
    author: authorCol?.innerHTML || '',
    desc: descCol?.innerHTML || ''
  };
}

/**
 * Generates the HTML template for the entire block using lit-html.
 */
function renderTemplate(items, config) {
  return html`
    <div class="quote-container ${config.className}">
      <div class="quotes-list">
        ${items.map((item, index) => html`
          <div class="quote-item-wrapper" data-index="${index}">
            <blockquote .innerHTML=${item.quote}></blockquote>
            ${item.author ? html`<cite>- <span .innerHTML=${item.author}></span></cite>` : ''}
            ${item.desc ? html`<p .innerHTML=${item.desc}></p>` : ''}
          </div>
        `)}
      </div>
    </div>
  `;
}

/**
 * Applies Universal Editor instrumentation.
 * Standard Behavior: Instrument the Item wrapper only.
 */
function applyInstrumentation(block, items) {
  const newItems = block.querySelectorAll('.quote-item-wrapper');
  
  newItems.forEach((newItem) => {
    const index = newItem.dataset.index;
    const originalItem = items[index];
    
    if (originalItem) {
      // Standard EDS Pattern: Instrument the Item Wrapper (li or div)
      moveInstrumentation(originalItem.sourceRow, newItem);
    }
  });
}

/**
 * Main Decorator Function
 */
export default function decorate(block) {
  console.log('decorate quotes', block.children);
  const config = extractConfig(block);
  const items = [...block.children].map(extractItemData);
  const template = renderTemplate(items, config);
  
  block.replaceChildren();
  render(template, block);
  
  applyInstrumentation(block, items);
}
