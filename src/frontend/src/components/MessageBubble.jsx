import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy } from 'lucide-react';

const MessageBubble = ({ role, content, isStreaming = false }) => {
  const isUser = role === 'user';
  
  const bubbleClasses = isUser 
    ? 'bg-blue-600 text-white ml-auto' 
    : 'bg-slate-800 text-slate-100 mr-auto';
  
  const containerClasses = `max-w-3xl w-full my-2 p-4 rounded-2xl shadow-lg ${bubbleClasses}`;
  
  const components = useMemo(() => ({
    code({ inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : 'text';
      
      if (inline) {
        return (
          <code 
            className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-200 text-sm" 
            {...props}
          >
            {children}
          </code>
        );
      }
      
      return (
        <div className="relative my-4">
          <div className="absolute top-2 right-2 z-10">
            <button
              className="bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors"
              onClick={() => navigator.clipboard.writeText(String(children))}
              title="Copy code"
            >
              <Copy size={12} />
              Copy
            </button>
          </div>
          <SyntaxHighlighter 
            style={oneDark} 
            language={language} 
            PreTag="div"
            className="rounded-lg"
            customStyle={{
              margin: 0,
              padding: '1rem',
              fontSize: '0.875rem',
              lineHeight: '1.5',
            }}
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      );
    },
    h1: ({ children }) => (
      <h1 className="text-2xl font-bold mb-4 text-slate-100">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-xl font-bold mb-3 text-slate-100">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-lg font-bold mb-2 text-slate-100">{children}</h3>
    ),
    p: ({ children }) => (
      <p className="mb-2 leading-relaxed">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="list-disc list-inside mb-2 ml-4">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside mb-2 ml-4">{children}</ol>
    ),
    li: ({ children }) => (
      <li className="mb-1">{children}</li>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-slate-600 pl-4 my-2 italic text-slate-300">
        {children}
      </blockquote>
    ),
    strong: ({ children }) => (
      <strong className="font-bold">{children}</strong>
    ),
    em: ({ children }) => (
      <em className="italic">{children}</em>
    ),
    a: ({ children, href }) => (
      <a 
        href={href} 
        className="text-blue-400 hover:text-blue-300 underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
  }), []);

  return (
    <div className={containerClasses}>
      <div className="prose prose-invert max-w-none">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]} 
          components={components}
          className="text-slate-100"
        >
          {content || ''}
        </ReactMarkdown>
        {isStreaming && (
          <span className="inline-block w-2 h-4 bg-slate-400 animate-pulse ml-1" />
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
