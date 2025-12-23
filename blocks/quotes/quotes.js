import { html, render } from 'https://esm.sh/lit-html';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Decorates the Quotes block.
 * This function handles the rendering of a list of quotes (Block + Item pattern).
 * 
 * @param {Element} block The block element
 */
export default function decorate(block) {
  // 1. EXTRACT BLOCK CONFIGURATION
  // In EDS, options like "Background Color" (e.g. "bg-red") are applied as classes to the block wrapper.
  // We extract this to apply it to our internal container if needed, or rely on CSS targeting the block.
  // Here we extract it to apply to the inner container for scoped styling.
  const className = [...block.classList].find(c => c.startsWith('bg-')) || '';
  
  // 2. EXTRACT ITEMS
  // We map over the block's children, where each child represents a "Quote Item".
  // The Universal Editor or Document might wrap items in an extra div, so we handle that nesting.
  const items = [...block.children].map(row => {
    // Check for nested wrapper (common in Universal Editor previews)
    // Structure: Row -> Wrapper -> [Field 1, Field 2]
    let contentRow = row;
    if (row.children.length === 1 && row.children[0].children.length > 1) {
      contentRow = row.children[0];
    }
    
    const [quoteCol, authorCol] = contentRow.children;
    
    return {
      sourceRow: row, // Keep reference to original DOM for instrumentation transfer
      quote: quoteCol?.innerHTML || '',
      author: authorCol?.innerHTML || '' // Use innerHTML to preserve UE instrumentation
    };
  });

  // 3. DEFINE TEMPLATE
  // We use lit-html for declarative rendering.
  // We add a 'data-index' to match new elements back to their source rows for instrumentation.
  const template = html`
    <div class="quote-container ${className}">
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

  // 4. RENDER
  // Replace the raw "rows" with our structured HTML.
  block.replaceChildren();
  render(template, block);

  // 5. APPLY INSTRUMENTATION (Post-Render)
  // This is critical for the Universal Editor. We must move the "data-aue-*" attributes
  // from the original source rows to the new rendered elements so they are selectable.
  const newItems = block.querySelectorAll('.quote-item-wrapper');
  newItems.forEach((newItem) => {
    const index = newItem.dataset.index;
    const originalItem = items[index];
    if (originalItem) {
      moveInstrumentation(originalItem.sourceRow, newItem);
    }
  });
}
