import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  Bot,
  User,
  ThumbsUp,
  ThumbsDown,
  Minimize2,
  Maximize2,
  Loader2
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { chatbotAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AIChatbot = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Hello! I\'m your RealtyEngage AI assistant. How can I help you find your dream property today?',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const [quickActions, setQuickActions] = useState([
    'View Available Properties',
    'Schedule Site Visit',
    'Calculate EMI',
    'Check Current Offers',
    'Contact Sales Team',
  ]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Call real API
      const response = await chatbotAPI.sendMessage(inputMessage);

      const botResponse = {
        id: messages.length + 2,
        type: 'bot',
        text: response.message || response.data?.message,
        timestamp: new Date(),
        quickActions: response.quickActions || response.data?.quickActions || response.suggestions || response.data?.suggestions,
      };

      setMessages(prev => [...prev, botResponse]);

      // Update quick actions if provided
      if (response.quickActions || response.data?.quickActions || response.suggestions || response.data?.suggestions) {
        setQuickActions(response.quickActions || response.data?.quickActions || response.suggestions || response.data?.suggestions);
      }
    } catch (error) {
      console.error('Chatbot error:', error);

      // Fallback response
      const botResponse = {
        id: messages.length + 2,
        type: 'bot',
        text: 'I apologize for the inconvenience. I\'m having trouble processing your request. Please try again or contact our support team directly at +91-9876543210.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (action) => {
    setInputMessage(action);
    inputRef.current?.focus();
  };

  const handleFeedback = (messageId, feedback) => {
    console.log(`Feedback for message ${messageId}: ${feedback}`);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed bottom-0 right-0 md:bottom-4 md:right-4 z-[200] w-full md:w-96 max-w-full md:max-w-[calc(100vw-2rem)]"
      >
        <Card className="shadow-2xl border-0 overflow-hidden">
          {/* Header */}
          <div className="hero-gradient text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">RealtyEngage Assistant</h3>
                  <div className="flex items-center space-x-1 text-xs">
                    <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                    <span>Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                  >
                    <div
                      className={`flex items-start space-x-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                        }`}
                    >
                      <div
                        className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${message.type === 'user'
                          ? 'bg-primary'
                          : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                      >
                        {message.type === 'user' ? (
                          <User className="h-4 w-4 text-white" />
                        ) : (
                          <Bot className="h-4 w-4 text-primary dark:text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div
                          className={`rounded-lg p-3 ${message.type === 'user'
                            ? 'bg-primary text-white'
                            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                            }`}
                        >
                          <div className="text-sm whitespace-pre-wrap">{message.text}</div>
                          {message.type === 'bot' && (
                            <div className="flex items-center space-x-2 mt-2">
                              <button
                                onClick={() => handleFeedback(message.id, 'up')}
                                className="text-gray-400 hover:text-green-500 transition-colors"
                              >
                                <ThumbsUp className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleFeedback(message.id, 'down')}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <ThumbsDown className="h-4 w-4" />
                              </button>
                              <span className="text-xs text-gray-400">
                                {new Date(message.timestamp).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {/* Typing Indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center space-x-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"
                  >
                    <Bot className="h-5 w-5 text-primary" />
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-gray-500">AI is thinking...</span>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions */}
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="flex flex-wrap gap-2 mb-3">
                  {quickActions.map((action, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
                      onClick={() => handleQuickAction(action)}
                    >
                      {action}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="flex space-x-2">
                  <Input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1"
                    disabled={isTyping}
                  />
                  <Button
                    type="submit"
                    disabled={!inputMessage.trim() || isTyping}
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIChatbot;
