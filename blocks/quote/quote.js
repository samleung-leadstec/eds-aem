import { html, render } from 'https://esm.sh/lit-html';

export default function decorate(block) {
  // 1. Analyze the DOM rows
  // The 'classes' field in JSON is special. If it's a style toggle, EDS often applies it 
  // directly to the block element (e.g., class="quote bg-red block").
  // So it might NOT appear as a row in block.children.
  
  const rows = [...block.children];

  // Based on your output:
  // Row 1: Quote
  // Row 2: Author
  // No Row 3 for class (it's already on the block)

  // So, Author is the last row.
  const authorRow = rows.pop();
  
  // All remaining rows are quotes
  const quoteRows = rows;

  // 2. Extract Data
  const props = {
    quotes: quoteRows.map(row => row.innerHTML), 
    author: authorRow?.textContent.trim(),
    // Check if bg-red/blue/green is in the block's class list
    className: [...block.classList].find(c => c.startsWith('bg-')) || '' 
  };

  // 3. Define Template
  const template = html`
    <div class="quote-container ${props.className}">
      <div class="quotes-list">
        ${props.quotes.map(quoteHtml => html`
          <blockquote .innerHTML=${quoteHtml}></blockquote>
        `)}
      </div>
      <cite>- ${props.author}</cite>
    </div>
  `;

  // 4. Render
  // We use replaceChildren to clear the old "rows" before rendering our new UI.
  // However, lit-html render() needs a container. 
  // If we render(template, block), it appends/diffs against existing children.
  // Best practice: clear block, then render.
  
  block.replaceChildren(); // Clear the raw rows
  render(template, block); // Render new content
}
