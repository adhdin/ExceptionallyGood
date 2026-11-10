import hljs from 'highlight.js/lib/core';
import java from 'highlight.js/lib/languages/java';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import json from 'highlight.js/lib/languages/json';
import yaml from 'highlight.js/lib/languages/yaml';
import properties from 'highlight.js/lib/languages/properties';
import bash from 'highlight.js/lib/languages/bash';
import sql from 'highlight.js/lib/languages/sql';
import css from 'highlight.js/lib/languages/css';
import kotlin from 'highlight.js/lib/languages/kotlin';
import python from 'highlight.js/lib/languages/python';

hljs.registerLanguage('java', java);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('json', json);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('properties', properties);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('css', css);
hljs.registerLanguage('kotlin', kotlin);
hljs.registerLanguage('python', python);

const aliases: Record<string, string> = {
  java: 'java',
  javascript: 'javascript',
  js: 'javascript',
  jsx: 'javascript',
  typescript: 'typescript',
  ts: 'typescript',
  tsx: 'typescript',
  html: 'xml',
  xml: 'xml',
  json: 'json',
  yaml: 'yaml',
  yml: 'yaml',
  bash: 'bash',
  shell: 'bash',
  sql: 'sql',
  css: 'css',
  kotlin: 'kotlin',
  python: 'python',
};

/** Liefert Highlight-HTML. Nutzt die Sprache des Eintrags als Hinweis, fällt sonst auf Auto-Erkennung zurück. */
export function highlightCode(code: string, languageHint?: string): { html: string; language: string } {
  const hint = aliases[(languageHint ?? '').trim().toLowerCase()];
  // Snippets enthalten oft gemischte Inhalte (YAML, Shell, XML in einem Java-Eintrag) → Auto-Erkennung mit Relevanzvergleich
  const auto = hljs.highlightAuto(code);
  if (hint) {
    const hinted = hljs.highlight(code, { language: hint, ignoreIllegals: true });
    if (hinted.relevance >= auto.relevance * 0.6) return { html: hinted.value, language: hint };
  }
  return { html: auto.value, language: auto.language ?? 'plaintext' };
}
