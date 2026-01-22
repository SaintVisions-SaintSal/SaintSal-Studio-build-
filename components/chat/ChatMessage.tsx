'use client';

import { Message } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`message ${isUser ? 'message-user' : 'message-assistant'}`}>
      {isUser ? (
        <p>{message.content}</p>
      ) : (
        <div className="markdown-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Custom link rendering
              a: ({ node, ...props }) => (
                <a {...props} target="_blank" rel="noopener noreferrer" />
              ),
              // Custom code block rendering
              code: ({ node, inline, className, children, ...props }: any) => {
                if (inline) {
                  return <code className={className} {...props}>{children}</code>;
                }
                return (
                  <pre>
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                );
              },
            }}
          >
            {message.content || ' '}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
