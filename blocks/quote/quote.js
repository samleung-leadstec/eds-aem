import { html, render } from 'https://esm.sh/lit-html';

export default function decorate(block) {
    console.log('Quote Block Raw Children:', [...block.children].map(c => c.outerHTML));
  const rows = [...block.children];

  // 1. Extract Author (Last Row)
  const authorRow = rows.pop();

  // 2. Extract Quotes (All previous rows)
  // Handle both flat structure (doc) and nested structure (Universal Editor)
  // Using flatMap handles both:
  // - If row has children (UE), map those children
  // - If row has no children (Doc), wrap row in array
  const quotes = rows.flatMap(row => 
    row.children.length > 0 
      ? [...row.children].map(child => child.innerHTML) 
      : [row.innerHTML]
  );

  // 3. Extract Class (Already on block)
  const className = [...block.classList].find(c => c.startsWith('bg-')) || '';

  const template = html`
    <div class="quote-container ${className}">
      <div class="quotes-list">
        ${quotes.map(quoteHtml => html`
          <blockquote .innerHTML=${quoteHtml}></blockquote>
        `)}
      </div>
      ${authorRow ? html`<cite>- ${authorRow.textContent.trim()}</cite>` : ''}
    </div>
  `;

  block.replaceChildren();
  render(template, block);
}
