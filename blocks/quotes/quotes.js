import { html, render } from 'https://esm.sh/lit-html';

export default function decorate(block) {
  // Map over children. Each child is a "row" corresponding to a Quote Item.
  // Expected structure per item: <div> <div>Quote HTML</div> <div>Author Text</div> </div>
  const items = [...block.children].map(row => {
    const [quoteCol, authorCol] = row.children;
    
    // If a row is malformed (e.g. author accidentally deleted or empty), handle gracefully
    return {
      quote: quoteCol?.innerHTML || '',
      author: authorCol?.textContent.trim() || ''
    };
  });

  // Extract Class from block wrapper (Universal Editor "Styles" or "Classes" via Metadata)
  // This supports .quotes.bg-red etc.
  const className = [...block.classList].find(c => c.startsWith('bg-')) || '';

  const template = html`
    <div class="quote-container ${className}">
      <div class="quotes-list">
        ${items.map(item => html`
          <blockquote .innerHTML=${item.quote}></blockquote>
          ${item.author ? html`<cite>- ${item.author}</cite>` : ''}
        `)}
      </div>
    </div>
  `;

  // Clear original rows (quote items) and render the list
  block.replaceChildren();
  render(template, block);
}
