import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Smile, Bot, User, Menu, Settings } from 'lucide-react'
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
import { ChevronDown, ChevronUp } from 'lucide-react'

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

  useEffect(() => {
    if (user) {
      fetchUserProfile()
    }
  }, [user])

  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages()
      subscribeToMessages()
    }
  }, [selectedConversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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

  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString())
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const insertTextAtCursor = (text: string) => {
    setNewMessage(prev => prev + text)
    textAreaRef.current?.focus()
  }

  const replaceMessageText = (text: string) => {
    setNewMessage(text)
    textAreaRef.current?.focus()
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

  return (
    <div className="flex h-[calc(100vh-16px)] bg-gray-900 text-white overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {showMobileSidebar && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 fixed lg:relative z-50 lg:z-auto
        transition-transform duration-300 ease-in-out
        ${sidebarExpanded ? 'w-80' : 'w-16'}
        bg-gray-800 border-r border-gray-700 flex flex-col h-full
      `}>
        {/* Sidebar Header */}
        <Collapsible open={sidebarExpanded} onOpenChange={setSidebarExpanded}>
          <CollapsibleTrigger asChild>
            <div className="p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  {sidebarExpanded && <h2 className="font-semibold">Copilot Chat</h2>}
                </div>
                {sidebarExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </div>
            </div>
          </CollapsibleTrigger>

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
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
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
            <ScrollArea className="flex-1 p-4 pb-2" onMouseUp={handleTextSelection}>
              <div className="space-y-4 max-w-4xl mx-auto">
                <AnimatePresence>
                  {messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isOwn={message.user_id === user?.id}
                    />
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="bg-gray-800 p-4 border-t border-gray-700">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-end space-x-2">
                  <div className="flex-1 relative">
                    <textarea
                      ref={textAreaRef}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 pr-12 resize-none max-h-28 min-h-[48px] focus:outline-none focus:ring-2 focus:ring-purple-500 scrollbar-thin scrollbar-thumb-purple-600/40 scrollbar-track-transparent"
                      rows={1}
                    />
                    <div className="absolute right-2 top-2 flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowEmojiSelector(!showEmojiSelector)}
                        className="text-gray-400 hover:text-yellow-400 p-1"
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
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-3"
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
      </div>

      {/* AI Copilot Sidebar - Desktop Only */}
      <AnimatePresence>
        {showAICopilot && selectedConversationId && (
          <div className="hidden md:block h-full">
            <AICopilot
              selectedText={selectedText}
              onInsertText={insertTextAtCursor}
              onReplaceText={replaceMessageText}
              conversationHistory={messages.map(m => m.content)}
              currentInput={newMessage}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ChatInterface
