import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Parse markdown into blocks
  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];

  let inTable = false;
  let tableHeader: string[] = [];
  let tableRows: string[][] = [];
  let tableKey = 0;

  const flushTable = () => {
    if (inTable && tableHeader.length > 0) {
      renderedElements.push(
        <div key={`table-${tableKey++}`} className="my-4 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/70 shadow-sm">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-100 font-semibold border-b border-slate-800">
              <tr>
                {tableHeader.map((th, i) => (
                  <th key={i} className="py-2.5 px-4 font-mono">
                    {th.trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {tableRows.map((row, rIndex) => (
                <tr key={rIndex} className="hover:bg-slate-900/40 transition">
                  {row.map((cell, cIndex) => (
                    <td key={cIndex} className="py-2.5 px-4 leading-relaxed font-sans">
                      {cell.trim()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      inTable = false;
      tableHeader = [];
      tableRows = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Table parsing
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const cells = trimmed
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());

      // Check if it's separator row |---|---|
      if (cells.every((c) => /^[-:]+$/.test(c))) {
        continue;
      }

      if (!inTable) {
        inTable = true;
        tableHeader = cells;
      } else {
        tableRows.push(cells);
      }
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Horizontal Rule
    if (trimmed === '---' || trimmed === '***') {
      renderedElements.push(
        <hr key={`hr-${i}`} className="my-6 border-slate-800" />
      );
      continue;
    }

    // Headings
    if (trimmed.startsWith('# ')) {
      renderedElements.push(
        <h1 key={`h1-${i}`} className="text-xl sm:text-2xl font-black text-white mt-6 mb-3 tracking-tight border-b border-slate-800 pb-2">
          {trimmed.replace('# ', '')}
        </h1>
      );
      continue;
    }
    if (trimmed.startsWith('## ')) {
      renderedElements.push(
        <h2 key={`h2-${i}`} className="text-lg font-bold text-emerald-300 mt-5 mb-2.5 flex items-center gap-2">
          <span className="w-1.5 h-4 bg-emerald-500 rounded-full" />
          {trimmed.replace('## ', '')}
        </h2>
      );
      continue;
    }
    if (trimmed.startsWith('### ')) {
      renderedElements.push(
        <h3 key={`h3-${i}`} className="text-sm font-bold text-slate-200 mt-4 mb-1.5">
          {trimmed.replace('### ', '')}
        </h3>
      );
      continue;
    }

    // Checkboxes
    if (trimmed.startsWith('- [ ] ') || trimmed.startsWith('- [x] ')) {
      const isChecked = trimmed.startsWith('- [x] ');
      const text = trimmed.replace(/- \[[ x]\] /, '');
      renderedElements.push(
        <label key={`chk-${i}`} className="flex items-start gap-2.5 my-1.5 text-xs text-slate-200 cursor-pointer group">
          <input
            type="checkbox"
            defaultChecked={isChecked}
            className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-400 bg-slate-900"
          />
          <span className="group-hover:text-emerald-300 transition leading-relaxed">{text}</span>
        </label>
      );
      continue;
    }

    // Bullet list items
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const bulletText = trimmed.replace(/^[-*] /, '');
      renderedElements.push(
        <div key={`li-${i}`} className="flex items-start gap-2 my-1.5 text-xs text-slate-300 leading-relaxed pl-2">
          <span className="text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
          <span>{renderInlineMarkdown(bulletText)}</span>
        </div>
      );
      continue;
    }

    // Numbered list items
    if (/^\d+\.\s/.test(trimmed)) {
      const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
      if (numMatch) {
        renderedElements.push(
          <div key={`num-${i}`} className="flex items-start gap-2.5 my-1.5 text-xs text-slate-300 leading-relaxed pl-2">
            <span className="font-mono font-bold text-emerald-400 shrink-0">{numMatch[1]}.</span>
            <span>{renderInlineMarkdown(numMatch[2])}</span>
          </div>
        );
        continue;
      }
    }

    // Empty lines
    if (trimmed === '') {
      continue;
    }

    // Standard Paragraph
    renderedElements.push(
      <p key={`p-${i}`} className="my-2 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
        {renderInlineMarkdown(trimmed)}
      </p>
    );
  }

  flushTable();

  return <div className="markdown-body space-y-1">{renderedElements}</div>;
};

// Render inline formatting (bold, italic, code, tags)
function renderInlineMarkdown(text: string): React.ReactNode {
  // Simple regex replacements for **bold** and `code`
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold **text**
    const boldMatch = remaining.match(/^(.*?)\*\*(.+?)\*\*(.*)/);
    // Code `text`
    const codeMatch = remaining.match(/^(.*?)`(.+?)`(.*)/);

    if (boldMatch && (!codeMatch || boldMatch[1].length <= codeMatch[1].length)) {
      if (boldMatch[1]) {
        parts.push(boldMatch[1]);
      }
      parts.push(
        <strong key={key++} className="font-bold text-slate-100">
          {boldMatch[2]}
        </strong>
      );
      remaining = boldMatch[3];
    } else if (codeMatch) {
      if (codeMatch[1]) {
        parts.push(codeMatch[1]);
      }
      parts.push(
        <code key={key++} className="font-mono text-[11px] bg-slate-800 px-1 py-0.5 rounded text-emerald-300">
          {codeMatch[2]}
        </code>
      );
      remaining = codeMatch[3];
    } else {
      parts.push(remaining);
      break;
    }
  }

  return parts.length > 0 ? parts : text;
}
