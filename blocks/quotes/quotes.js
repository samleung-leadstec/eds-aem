import { html, render } from 'https://esm.sh/lit-html';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const className = [...block.classList].find(c => c.startsWith('bg-')) || '';
  
  const items = [...block.children].map(row => {
    let contentRow = row;
    let cols = [...row.children];
    if (cols.length === 1 && cols[0].children.length > 1) {
      contentRow = cols[0]; 
      cols = [...contentRow.children];
    }
    
    const [quoteCol, authorCol] = cols;

    return {
      sourceRow: row,
      quote: quoteCol?.innerHTML || '',
      author: authorCol?.innerHTML || '' 
    };
  });

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

  block.replaceChildren();
  render(template, block);

  const newItems = block.querySelectorAll('.quote-item-wrapper');
  newItems.forEach((newItem) => {
    const index = newItem.dataset.index;
    const originalItem = items[index];
    if (originalItem) {
      moveInstrumentation(originalItem.sourceRow, newItem);
    }
  });
}
