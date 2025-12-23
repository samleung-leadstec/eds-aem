import { html, render } from 'https://esm.sh/lit-html';

export default function decorate(block) {
  // Debug log to see exactly what UE is giving us
  // console.log('Quotes Children:', [...block.children].map(c => c.innerHTML));

  const items = [...block.children].map(row => {
    let cols = [...row.children];
    
    // Robustness: If the row has only 1 child which itself has children, 
    // it's likely a wrapper div (e.g. <div class="quoteitem">...</div>)
    if (cols.length === 1 && cols[0].children.length > 1) {
      cols = [...cols[0].children];
    }

    const [quoteCol, authorCol] = cols;
    
    return {
      quote: quoteCol?.innerHTML || '',
      author: authorCol?.textContent.trim() || ''
    };
  }).filter(item => item.quote || item.author); // Filter out completely empty items

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
