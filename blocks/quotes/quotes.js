import { html, render } from 'https://esm.sh/lit-html';

export default function decorate(block) {
  // Now, each child of the block is a "Quote Item" row
  // Structure of each row: <div>Quote</div> <div>Author</div>
  
  const items = [...block.children].map(row => {
    const [quoteCol, authorCol] = row.children;
    return {
      quote: quoteCol?.innerHTML || '',
      author: authorCol?.textContent.trim() || ''
    };
  });

  // Extract Class (Already on block wrapper via UE/Metadata)
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

  block.replaceChildren();
  render(template, block);
}
