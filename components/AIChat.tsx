'use client';

import { useChat } from 'ai/react';
import { useRef, useEffect, useState } from 'react';
import { PaperAirplaneIcon, SparklesIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import ParentingStyleSelector from './ParentingStyleSelector';

interface Child {
  id: string;
  name: string;
  birthdate: string | null;
}

interface AIChatProps {
  children: Child[];
  selectedStyle: string;
  customStyles: any[];
  onStyleChange: (styleId: string) => void;
  onCreateCustomStyle: () => void;
}

export default function AIChat({ children, selectedStyle, customStyles, onStyleChange, onCreateCustomStyle }: AIChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Calculate child ages for context
  const childContext = {
    children: children.map((child) => {
      let age: number | undefined;
      if (child.birthdate) {
        const birthDate = new Date(child.birthdate);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
      }
      return {
        name: child.name,
        age,
        birthdate: child.birthdate || undefined,
      };
    }),
  };

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: '/api/chat',
    body: {
      childContext,
      selectedStyle,
      customStyles,
      conversationId,
    },
    onFinish: async (message) => {
      // Save assistant message to database
      if (conversationId) {
        try {
          await fetch('/api/chat/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              conversationId,
              role: 'assistant',
              content: message.content,
            }),
          });
        } catch (error) {
          console.error('Error saving assistant message:', error);
        }
      }
    },
  });

  // Load existing conversation when style changes
  useEffect(() => {
    const loadConversation = async () => {
      try {
        // Get existing conversation for this parenting style
        const response = await fetch(`/api/chat/conversations?parentingStyle=${selectedStyle}`);
        const conversations = await response.json();

        if (conversations && conversations.length > 0) {
          const conv = conversations[0];
          setConversationId(conv.id);

          // Load messages for this conversation
          const messagesResponse = await fetch('/api/chat/conversations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conversationId: conv.id }),
          });

          const savedMessages = await messagesResponse.json();

          // Transform database messages to chat format
          const formattedMessages = savedMessages.map((msg: any) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
          }));

          setMessages(formattedMessages);
        } else {
          // No existing conversation, start fresh
          setConversationId(null);
          setMessages([]);
        }

        setIsSaved(false);
      } catch (error) {
        console.error('Error loading conversation:', error);
        setConversationId(null);
        setMessages([]);
      }
    };

    loadConversation();
  }, [selectedStyle, setMessages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle saving conversation with key takeaways
  const handleSaveConversation = async () => {
    if (!conversationId || messages.length === 0 || isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch('/api/chat/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          messages,
        }),
      });

      if (response.ok) {
        setIsSaved(true);
        // Reset saved state after 3 seconds
        setTimeout(() => setIsSaved(false), 3000);
      } else {
        console.error('Failed to save conversation');
      }
    } catch (error) {
      console.error('Error saving conversation:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-white rounded-2xl shadow-sm border border-sand">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-sand">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sage to-rose flex items-center justify-center">
            <SparklesIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-serif text-gray-900">Liv</h2>
            <p className="text-xs text-gray-500">Your parenting coach</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {messages.length > 0 && (
            <button
              onClick={handleSaveConversation}
              disabled={isSaving || !conversationId}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                isSaved
                  ? 'bg-green-50 text-green-700 border-2 border-green-300'
                  : 'bg-white text-gray-700 border-2 border-sand hover:border-sage hover:text-sage'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title="Save conversation with key takeaways"
            >
              {isSaved ? (
                <>
                  <BookmarkSolidIcon className="w-5 h-5" />
                  <span className="text-sm">Saved!</span>
                </>
              ) : (
                <>
                  <BookmarkIcon className="w-5 h-5" />
                  <span className="text-sm">Save</span>
                </>
              )}
            </button>
          )}

          <ParentingStyleSelector
            selectedStyle={selectedStyle}
            customStyles={customStyles}
            onStyleChange={onStyleChange}
            onCreateCustomStyle={onCreateCustomStyle}
          />
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 rounded-full bg-sage/10 flex items-center justify-center mb-4">
              <SparklesIcon className="w-8 h-8 text-sage" />
            </div>
            <h3 className="text-xl font-serif text-gray-900 mb-2">
              Hey, I'm Liv
            </h3>
            <p className="text-gray-600 mb-6 max-w-md">
              Your wise older sister who's been there. I'm here to help you live the little things—not just survive them.
              Ask me anything about behavior, discipline, connection, or those everyday moments that matter.
            </p>
            <div className="grid gap-2 w-full max-w-md">
              <button
                onClick={() => {
                  const exampleInput = "My 4-year-old won't listen when I ask them to clean up their toys. What should I do?";
                  handleInputChange({
                    target: { value: exampleInput },
                  } as React.ChangeEvent<HTMLInputElement>);
                }}
                className="text-left p-3 bg-cream rounded-lg border border-sand hover:border-sage transition-colors text-sm text-gray-700"
              >
                "My child won't listen when I ask them to clean up..."
              </button>
              <button
                onClick={() => {
                  const exampleInput = "How do I handle tantrums in public?";
                  handleInputChange({
                    target: { value: exampleInput },
                  } as React.ChangeEvent<HTMLInputElement>);
                }}
                className="text-left p-3 bg-cream rounded-lg border border-sand hover:border-sage transition-colors text-sm text-gray-700"
              >
                "How do I handle tantrums in public?"
              </button>
              <button
                onClick={() => {
                  const exampleInput = "What are some age-appropriate choices I can give my child?";
                  handleInputChange({
                    target: { value: exampleInput },
                  } as React.ChangeEvent<HTMLInputElement>);
                }}
                className="text-left p-3 bg-cream rounded-lg border border-sand hover:border-sage transition-colors text-sm text-gray-700"
              >
                "What are some age-appropriate choices I can give?"
              </button>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-sage text-white'
                  : 'bg-cream text-gray-800 border border-sand'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-2">
                  <SparklesIcon className="w-4 h-4 text-rose" />
                  <span className="text-xs font-medium text-gray-600">
                    Liv
                  </span>
                </div>
              )}
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {message.content}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-cream border border-sand">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-sage rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-sage rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-sage rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs text-gray-500">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-sand bg-cream/30"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="What's on your mind?"
            disabled={isLoading}
            className="flex-1 px-4 py-3 border border-sand rounded-xl focus:ring-2 focus:ring-sage focus:border-transparent outline-none transition-all bg-white disabled:bg-gray-50 disabled:text-gray-500"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`px-6 py-3 rounded-xl font-medium text-white transition-all flex items-center gap-2 ${
              input.trim() && !isLoading
                ? 'bg-sage hover:scale-[1.02]'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            <span className="hidden sm:inline">Send</span>
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          This AI coach is not a substitute for professional medical or mental health advice.
        </p>
      </form>
    </div>
  );
}
