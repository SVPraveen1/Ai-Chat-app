import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { Send, Smile, Bot, User, Settings, MessageSquareText } from 'lucide-react' // Added MessageSquareText
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import MessageBubble from './MessageBubble'
import AICopilot from './AICopilot'
import EmojiSelector from './EmojiSelector'
import ConversationsList from './ConversationsList'
import UserSearch from './UserSearch'
import { useToast } from '@/hooks/use-toast'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown, ChevronUp, Menu } from 'lucide-react'
import { chatSidebarVariants, messageVariants, typingIndicatorVariants } from '@/animations/chatAnimations'
import { fadeIn, slideIn } from '@/animations'

interface Message {
  id: string
  content: string
  user_id: string
  conversation_id: string
  created_at: string
  is_edited?: boolean
  updated_at?: string
}

interface Profile {
  username: string
  full_name: string | null
}

// New interface for the Ask AI popup state
interface AskAiPopupState {
  visible: boolean;
  text: string;
  position: { x: number; y: number };
}

const ChatInterface = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [showEmojiSelector, setShowEmojiSelector] = useState(false)
  const [showAICopilot, setShowAICopilot] = useState(true)
  const [selectedText, setSelectedText] = useState('')
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null)
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [showUserSearch, setShowUserSearch] = useState(false)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const controls = useAnimation()
  const sidebarControls = useAnimation()
  
  // Animation variants for the chat container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        when: "beforeChildren"
      }
    }
  }

  // State for the "Ask AI" popup
  const [askAiPopupState, setAskAiPopupState] = useState<AskAiPopupState>({ visible: false, text: '', position: { x: 0, y: 0 } });
  // State to hold the text to be sent to AI Copilot chat
  const [textForCopilotChat, setTextForCopilotChat] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (user) {
      fetchUserProfile()
    }
  }, [user])

  useEffect(() => {
    // Auto-resize textarea when component mounts
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto'
      textAreaRef.current.style.height = `${Math.min(textAreaRef.current.scrollHeight, 200)}px`
    }
  }, [newMessage])

  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages()
      subscribeToMessages()
    }
  }, [selectedConversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Effect to close popup when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // A bit simplistic, might need a ref on the popup itself if it becomes complex
      if (askAiPopupState.visible && !(event.target as HTMLElement).closest('.ask-ai-popup-class')) { // Add a class to your popup
        setAskAiPopupState({ visible: false, text: '', position: { x: 0, y: 0 } });
      }
    };
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && askAiPopupState.visible) {
        setAskAiPopupState({ visible: false, text: '', position: { x: 0, y: 0 } });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [askAiPopupState.visible]);

  useEffect(() => {
    // Add a CSS class to the body when text is being selected to give a visual indicator
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim() !== '') {
        document.body.classList.add('text-selecting-mode');
      } else {
        document.body.classList.remove('text-selecting-mode');
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.body.classList.remove('text-selecting-mode');
    };
  }, []);

  const fetchUserProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, full_name')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setCurrentProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const fetchMessages = async () => {
    if (!selectedConversationId) return

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', selectedConversationId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const subscribeToMessages = () => {
    if (!selectedConversationId) return

    const channel = supabase
      .channel(`messages:${selectedConversationId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversationId}`
        },
        (payload) => {
          const newMessage = payload.new as Message
          setMessages(prev => [...prev, newMessage])
          scrollToBottom()
        }
      )
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversationId}`
        },
        (payload) => {
          const updatedMessage = payload.new as Message
          setMessages(prev => prev.map(msg => 
            msg.id === updatedMessage.id ? updatedMessage : msg
          ))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedConversationId) return

    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          content: newMessage.trim(),
          user_id: user.id,
          conversation_id: selectedConversationId
        }])

      if (error) throw error

      setNewMessage('')
      setShowEmojiSelector(false)
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleTextSelection = (event: React.MouseEvent) => { // Accept MouseEvent to get coordinates
    const selection = window.getSelection();
    const selectedTextContent = selection?.toString().trim();

    if (selection && selectedTextContent) {
      // For AI Features (direct use)
      setSelectedText(selectedTextContent);

      // For "Ask AI" popup
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      // Calculate a better position for the popup:
      // Center horizontally relative to the selection, but ensure it's visible in viewport
      const popupWidth = 330; // Approximate width of our popup
      let xPos = rect.left + (rect.width / 2) - (popupWidth / 2);
      
      // Ensure popup doesn't go off-screen to the left or right
      const viewportWidth = window.innerWidth;
      xPos = Math.max(10, xPos); // At least 10px from left edge
      xPos = Math.min(xPos, viewportWidth - popupWidth - 10); // At least 10px from right edge
      
      setAskAiPopupState({
        visible: true,
        text: selectedTextContent,
        position: { 
          x: xPos, 
          y: rect.bottom + window.scrollY + 5 // Position popup below the selection
        }, 
      });
    } else if (!selectedTextContent && askAiPopupState.visible) {
      // If selection is cleared, hide the popup unless a click was on the popup itself
      // The useEffect for click outside will handle clicks not on the popup
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const insertTextAtCursor = (text: string) => {
    setNewMessage(prev => prev + text)
    textAreaRef.current?.focus()
  }

  const replaceMessageText = (text: string) => {
    setNewMessage(text)
    // Force to run on next tick to ensure DOM is updated
    setTimeout(() => {
      if (textAreaRef.current) {
        textAreaRef.current.focus()
        textAreaRef.current.style.height = 'auto'
        textAreaRef.current.style.height = `${Math.min(textAreaRef.current.scrollHeight, 200)}px`
      }
    }, 0)
  }

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji)
    setShowEmojiSelector(false)
    textAreaRef.current?.focus()
  }

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId)
    setShowUserSearch(false)
    setShowMobileSidebar(false)
  }

  const handleNewConversation = () => {
    setShowUserSearch(true)
  }

  const handleConversationCreated = (conversationId: string) => {
    setSelectedConversationId(conversationId)
    setShowUserSearch(false)
    setShowMobileSidebar(false)
  }

  const handleAskAiClick = () => {
    setTextForCopilotChat(askAiPopupState.text);
    setAskAiPopupState({ visible: false, text: '', position: { x: 0, y: 0 } });
    setShowAICopilot(true); // Ensure AI Copilot panel is visible
  };

  const handleCopilotChatTextProcessed = () => {
    setTextForCopilotChat(undefined); // Clear the text after AICopilot has handled it
  };

  return (
    <div className="flex h-[calc(100vh-16px)] bg-slate-900 text-white overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {showMobileSidebar && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setShowMobileSidebar(false)}
        >
          <div className="flex items-center space-x-2 p-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            {sidebarExpanded && <h2 className="font-semibold">Copilot Chat</h2>}
          </div>
        </div>
      )}
      
      {/* Sidebar/Conversations Panel */}
      <Collapsible 
        className="h-full bg-gray-900 border-r border-gray-800"
        open={sidebarExpanded}
        onOpenChange={setSidebarExpanded}
      >
        <CollapsibleContent>
          {/* Conversations */}
          <div className="flex-1 overflow-hidden">
            {showUserSearch ? (
              <UserSearch
                onBack={() => setShowUserSearch(false)}
                onConversationCreated={handleConversationCreated}
              />
            ) : (
              <ConversationsList
                selectedConversationId={selectedConversationId}
                onSelectConversation={handleSelectConversation}
                onNewConversation={handleNewConversation}
              />
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

    {/* Main Chat Area */}
    <motion.div 
      className="flex-1 flex flex-col h-full overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {selectedConversationId ? (
        <>
          {/* Header */}
          <div className="bg-gray-800 p-4 border-b border-gray-700 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                className="lg:hidden text-gray-400 hover:text-white"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold">{currentProfile?.username?.[0]?.toUpperCase() || 'C'}</span>
              </div>
              <div>
                <h2 className="font-semibold">{currentProfile?.username || 'User'}</h2>
                <p className="text-sm text-green-400">Active</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAICopilot(!showAICopilot)}
                className={`md:flex ${showAICopilot ? 'text-purple-400' : 'text-gray-400'} hover:text-purple-300`}
              >
                <Bot className="w-5 h-5 mr-1" />
                AI Copilot
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4 overflow-y-auto">
            <motion.div 
              className="space-y-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence mode="popLayout">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    custom={index}
                    variants={messageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    layout
                  >
                    <MessageBubble
                      message={message}
                      isOwn={message.user_id === user?.id}
                    />
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </AnimatePresence>
            </motion.div>
          </ScrollArea>

          {/* Message Input */}
          <div className="bg-slate-800 p-4 border-t border-slate-700">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-end space-x-2">
                <div className="flex-1 relative">
                  <textarea
                    ref={textAreaRef}
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value)
                      // Auto-resize the textarea based on content
                      e.target.style.height = 'auto'
                      e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 pr-12 resize-none max-h-28 min-h-[48px] focus:outline-none focus:ring-2 focus:ring-blue-500 scrollbar-thin scrollbar-thumb-blue-600/40 scrollbar-track-transparent"
                    rows={1}
                  />
                  <div className="absolute right-2 top-2 flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowEmojiSelector(!showEmojiSelector)}
                      className="text-slate-400 hover:text-yellow-400 p-1"
                    >
                      <Smile className="w-4 h-4" />
                    </Button>
                  </div>
                  {showEmojiSelector && (
                    <div className="absolute bottom-12 right-0 z-10">
                      <EmojiSelector onEmojiSelect={handleEmojiSelect} />
                    </div>
                  )}
                </div>
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : (
        // Welcome screen
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">
              Welcome, {currentProfile?.full_name || currentProfile?.username}!
            </h2>
            <p className="text-gray-400 mb-6">Select a conversation to start messaging</p>
            <Button
              onClick={handleNewConversation}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Start New Chat
            </Button>
          </div>
        </div>
      )}
    </motion.div>

    {/* "Ask AI" Popup */}
    {askAiPopupState.visible && (
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: 0.2 }}
        className="ask-ai-popup-class fixed bg-gray-700/95 backdrop-blur-sm border border-purple-400 rounded-lg shadow-xl p-3 z-[100] flex flex-col animate-fadeIn"
        style={{ 
          top: askAiPopupState.position.y, 
          left: askAiPopupState.position.x,
          maxWidth: '330px',
          boxShadow: '0 4px 20px rgba(124, 58, 237, 0.25)'
        }}
      >
        <div className="mb-2">
          <p className="text-xs text-purple-300 font-medium">Selected Text:</p>
          <p className="text-sm text-gray-200 max-h-16 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-purple-600/40 scrollbar-track-transparent">
            "{askAiPopupState.text.length > 100 ? askAiPopupState.text.substring(0, 100) + '...' : askAiPopupState.text}"
          </p>
        </div>
        <div className="flex items-center justify-between space-x-2">
          <Button 
            size="sm"
            variant="default"
            onClick={handleAskAiClick}
            className="bg-purple-600 hover:bg-purple-700 text-white h-8 px-3 flex-1"
          >
            <MessageSquareText className="w-4 h-4 mr-1.5" />
            Ask AI Copilot
          </Button>
          <Button 
            size="sm"
            variant="ghost"
            onClick={() => setAskAiPopupState({ visible: false, text: '', position: { x: 0, y: 0 } })}
            className="text-gray-400 hover:text-white h-8 px-2"
          >
            Dismiss
          </Button>
        </div>
      </motion.div>
    )}
      <AnimatePresence>
        {showAICopilot && selectedConversationId && (
          <div className="hidden md:block h-full">
            <AICopilot
              selectedText={selectedText} // This remains for the "AI Features" tab direct use
              onInsertText={insertTextAtCursor}
              onReplaceText={replaceMessageText}
              conversationHistory={messages.map(m => m.content)}
              currentInput={newMessage}
              selectedTextForCopilotChat={textForCopilotChat} // New prop
              onCopilotChatTextProcessed={handleCopilotChatTextProcessed} // New prop
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ChatInterface

