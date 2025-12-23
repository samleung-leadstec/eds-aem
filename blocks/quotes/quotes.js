import { html, render } from 'https://esm.sh/lit-html';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * ===========================================================================
 * EDS COMPONENT PATTERN: QUOTES
 * ===========================================================================
 * This block demonstrates the standard "Block + Item" architecture for AEM Edge Delivery Services.
 * It supports:
 * 1.  Container Block ("Quotes") with styling options.
 * 2.  List of Items ("Quote") added via Universal Editor.
 * 3.  Inline Editing (Instrumentation) for both the list items and their individual fields.
 * 4.  lit-html for declarative, clean templating.
 */

/**
 * Helper to extract content columns from a DOM row.
 * Handles the variability in DOM structure between Document-based authoring (flat)
 * and Universal Editor previews (often nested in wrappers).
 * 
 * @param {Element} row The raw DOM row provided by the block.
 * @returns {Element[]} Array of column elements containing the actual content.
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
 * In EDS, fields named "classes" or Style Dropdowns typically apply classes directly to the block.
 * 
 * @param {Element} block The main block element.
 * @returns {Object} Configuration object.
 */
function extractConfig(block) {
  return {
    // Extract any class starting with 'bg-' to apply to our internal container
    className: [...block.classList].find(c => c.startsWith('bg-')) || ''
  };
}

/**
 * Transforms a raw DOM row into a clean data object.
 * Also captures references to the source DOM elements to re-attach instrumentation later.
 * 
 * @param {Element} row The raw row element.
 * @returns {Object} Structured item data including source references.
 */
function extractItemData(row) {
  const [quoteCol, authorCol] = getRowContent(row);

  return {
    sourceRow: row,          // Reference to the Row (Item) for selection
    sourceQuote: quoteCol,   // Reference to the Quote Field for inline editing
    sourceAuthor: authorCol, // Reference to the Author Field for inline editing
    quote: quoteCol?.innerHTML || '',
    author: authorCol?.innerHTML || ''
  };
}

/**
 * Generates the HTML template for the entire block using lit-html.
 * 
 * @param {Object[]} items Array of item data objects.
 * @param {Object} config Block configuration object.
 * @returns {TemplateResult} The rendered template.
 */
function renderTemplate(items, config) {
  return html`
    <div class="quote-container ${config.className}">
      <div class="quotes-list">
        ${items.map((item, index) => html`
          <!-- 
            We add a wrapper for the item.
            'data-index' is used to map this rendered element back to the source item data 
            during the instrumentation phase.
          -->
          <div class="quote-item-wrapper" data-index="${index}">
            <!-- 
              We add classes (e.g. 'quote-content') to target these specific elements 
              for field-level instrumentation later.
            -->
            <blockquote class="quote-content" .innerHTML=${item.quote}></blockquote>
            ${item.author ? html`<cite>- <span class="quote-author" .innerHTML=${item.author}></span></cite>` : ''}
          </div>
        `)}
      </div>
    </div>
  `;
}

/**
 * Applies Universal Editor instrumentation (blue edit boxes) to the rendered elements.
 * This function moves the semantic connection from the original (now deleted) DOM nodes
 * to the new lit-html rendered nodes.
 * 
 * @param {Element} block The block element.
 * @param {Object[]} items The data items containing source references.
 */
function applyInstrumentation(block, items) {
  const newItems = block.querySelectorAll('.quote-item-wrapper');
  
  newItems.forEach((newItem) => {
    const index = newItem.dataset.index;
    const originalItem = items[index];
    
    if (originalItem) {
      // 1. Instrument the ITEM (The whole row) - Allows moving/deleting the item
      moveInstrumentation(originalItem.sourceRow, newItem);

      // 2. Instrument the QUOTE Field - Allows clicking text to edit
      const newQuote = newItem.querySelector('.quote-content');
      if (newQuote && originalItem.sourceQuote) {
        moveInstrumentation(originalItem.sourceQuote, newQuote);
      }

      // 3. Instrument the AUTHOR Field - Allows clicking author to edit
      const newAuthor = newItem.querySelector('.quote-author');
      if (newAuthor && originalItem.sourceAuthor) {
        moveInstrumentation(originalItem.sourceAuthor, newAuthor);
      }
    }
  });
}

/**
 * Main Decorator Function
 * This function is the entry point called by the EDS framework.
 * 
 * @param {Element} block The block element to decorate.
 */
export default function decorate(block) {
  // 1. Config
  const config = extractConfig(block);
  
  // 2. Data Extraction
  const items = [...block.children].map(extractItemData);
  
  // 3. Template Generation
  const template = renderTemplate(items, config);
  
  // 4. Rendering (Replace content)
  block.replaceChildren();
  render(template, block);
  
  // 5. Instrumentation (Re-attach editor capabilities)
  applyInstrumentation(block, items);
}
