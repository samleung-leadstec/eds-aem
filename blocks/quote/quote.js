import { html, render } from 'https://esm.sh/lit-html';

export default function decorate(block) {
  const rows = [...block.children];

  // 1. Extract known single fields from the bottom
  // (We know 'classes' is on the block, so we ignore looking for it in rows)
  // The last row is definitely the Author.
  const authorRow = rows.pop();

  // 2. Identify the Quotes content
  // The remaining 'rows' are for the quotes.
  let quotes = [];
  
  if (rows.length === 1) {
    // SCENARIO A: All quotes are grouped in a single row (Common for UE multi-fields)
    // Structure: <div> <div>Quote 1</div> <div>Quote 2</div> </div>
    const container = rows[0];
    if (container.children.length > 0) {
      quotes = [...container.children].map(div => div.innerHTML);
    } else {
      // Fallback: Just text or single item
      quotes = [container.innerHTML];
    }
  } else {
    // SCENARIO B: Quotes are spread across multiple rows (Document-based authoring)
    // Structure: <div>Quote 1</div> <div>Quote 2</div>
    quotes = rows.map(row => row.innerHTML);
  }

  const props = {
    quotes: quotes,
    author: authorRow?.textContent.trim(),
    className: [...block.classList].find(c => c.startsWith('bg-')) || '' 
  };

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

  block.replaceChildren();
  render(template, block);
}
