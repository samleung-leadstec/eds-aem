import { html, render } from 'https://esm.sh/lit-html';

export default function decorate(block) {
  // 1. Destructure based on _quote.json fields order
  // When multi=true, the Universal Editor does NOT necessarily group them into one row.
  // Instead, typically in EDS/Frankin, "multi" fields often appear as multiple rows 
  // or a list inside a row depending on the content source.
  // BUT for a standard Block model with a multi-field at the start, 
  // we need to be careful. The safest way is to read ALL children.
  
  const rows = [...block.children];
  
  // Based on your JSON:
  // 1. Quotes (Multi) -> Can be 1 to N rows
  // 2. Author (Single) -> 1 Row
  // 3. Classes (Single) -> 1 Row
  
  // We pop from the end because the single fields at the bottom are stable.
  const classRow = rows.pop();
  const authorRow = rows.pop();
  
  // The remaining rows are ALL quotes (since quotes is multi)
  const quoteRows = rows;

  const props = {
    quotes: quoteRows.map(row => row.innerHTML), // Get HTML of each quote row
    author: authorRow?.textContent.trim(),
    className: classRow?.textContent.trim()
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

  render(template, block);
}
