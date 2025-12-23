import { html, render } from 'https://esm.sh/lit-html';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const className = [...block.classList].find(c => c.startsWith('bg-')) || '';
  
  // 1. Prepare the items data
  const items = [...block.children].map(row => {
    // Handle nested wrappers (Universal Editor behavior)
    let contentRow = row;
    let cols = [...row.children];
    if (cols.length === 1 && cols[0].children.length > 1) {
      contentRow = cols[0]; // The inner wrapper has the content
      cols = [...contentRow.children];
    }
    
    // We want to move instrumentation from the *original* row (the direct child of block)
    // to our new list item.
    
    const [quoteCol, authorCol] = cols;
    
    return {
      sourceRow: row, // Keep reference to original DOM for instrumentation
      quote: quoteCol?.innerHTML || '',
      author: authorCol?.textContent.trim() || ''
    };
  }).filter(item => item.quote || item.author);

  // 2. Define Template
  // Note: We add a 'ref' class or ID to easily find these items later for instrumentation
  const template = html`
    <div class="quote-container ${className}">
      <div class="quotes-list">
        ${items.map((item, index) => html`
          <div class="quote-item-wrapper" data-index="${index}">
            <blockquote .innerHTML=${item.quote}></blockquote>
            ${item.author ? html`<cite>- ${item.author}</cite>` : ''}
          </div>
        `)}
      </div>
    </div>
  `;

  // 3. Render
  block.replaceChildren();
  render(template, block);

  // 4. Apply Instrumentation (Post-Render)
  // We match the original rows to the new rendered elements
  const newItems = block.querySelectorAll('.quote-item-wrapper');
  newItems.forEach((newItem) => {
    const index = newItem.dataset.index;
    const originalItem = items[index];
    if (originalItem) {
      moveInstrumentation(originalItem.sourceRow, newItem);
    }
  });
}
