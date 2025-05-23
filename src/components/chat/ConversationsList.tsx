import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, MessageSquare, MoreVertical, Trash2, Eraser } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Conversation {
  id: string
  last_message: string | null
  last_message_at: string | null
  other_user: {
    username: string
    full_name: string | null
    status: string | null
  }
}

interface ConversationsListProps {
  selectedConversationId: string | null
  onSelectConversation: (conversationId: string) => void
  onNewConversation: () => void
}

const ConversationsList: React.FC<ConversationsListProps> = ({
  selectedConversationId,
  onSelectConversation,
  onNewConversation
}) => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [isActionProcessing, setIsActionProcessing] = useState(false)

  useEffect(() => {
    if (!user) return
    
    fetchConversations()
  }, [user])

  const fetchConversations = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('participants')
        .select(`
          conversation_id,
          conversations!inner(
            id,
            last_message,
            last_message_at,
            updated_at
          )
        `)
        .eq('user_id', user.id)
        .order('conversations(updated_at)', { ascending: false })

      if (error) throw error

      // Get other participants for each conversation
      const conversationsWithUsers = await Promise.all(
        (data || []).map(async (participant) => {
          const { data: otherParticipants, error: participantError } = await supabase
            .from('participants')
            .select(`
              user_id,
              profiles!inner(
                username,
                full_name,
                status
              )
            `)
            .eq('conversation_id', participant.conversation_id)
            .neq('user_id', user.id)
            .limit(1)

          if (participantError) throw participantError

          const otherUser = otherParticipants?.[0]?.profiles

          return {
            id: participant.conversation_id,
            last_message: participant.conversations.last_message,
            last_message_at: participant.conversations.last_message_at,
            other_user: otherUser || { username: 'Unknown', full_name: null, status: null }
          }
        })
      )

      setConversations(conversationsWithUsers)
    } catch (error) {
      console.error('Error fetching conversations:', error)
      toast({
        title: 'Error',
        description: 'Failed to load conversations',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString()
    }
  }
  
  const handleClearChat = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the conversation selection
    if (isActionProcessing) return
    
    setIsActionProcessing(true)
    try {
      // Delete all messages in the conversation but keep the conversation
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId)
      
      if (error) throw error
      
      // Update the conversation's last message
      await supabase
        .from('conversations')
        .update({ 
          last_message: null,
          last_message_at: null
        })
        .eq('id', conversationId)
      
      // Refresh the conversation list
      fetchConversations()
      
      toast({
        title: 'Chat cleared',
        description: 'All messages have been removed from this chat',
      })
    } catch (error) {
      console.error('Error clearing chat:', error)
      toast({
        title: 'Error',
        description: 'Failed to clear chat',
        variant: 'destructive'
      })
    } finally {
      setIsActionProcessing(false)
    }
  }
  
  const handleDeleteChat = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the conversation selection
    if (isActionProcessing) return
    
    setIsActionProcessing(true)
    try {
      // Delete all messages first (foreign key constraint)
      await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId)
      
      // Delete all participants
      await supabase
        .from('participants')
        .delete()
        .eq('conversation_id', conversationId)
      
      // Finally delete the conversation
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId)
      
      if (error) throw error
      
      // Remove from local state
      setConversations(conversations.filter(conv => conv.id !== conversationId))
      
      // If this was the selected conversation, reset selection
      if (selectedConversationId === conversationId) {
        onSelectConversation('')
      }
      
      toast({
        title: 'Chat deleted',
        description: 'The conversation has been permanently deleted',
      })
    } catch (error) {
      console.error('Error deleting chat:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete chat',
        variant: 'destructive'
      })
    } finally {
      setIsActionProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="w-80 bg-gray-800 border-r border-gray-700 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
      </div>
    )
  }
  
  // Processing overlay for actions like clearing or deleting chats
  const ActionProcessingOverlay = () => {
    if (!isActionProcessing) return null;
    return (
      <div className="absolute inset-0 bg-gray-900/70 flex items-center justify-center z-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-400 mb-2"></div>
          <p className="text-purple-400 text-sm font-medium">Processing...</p>
        </div>
      </div>
    );
  };

  return (
    <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col relative">
      {/* Processing Overlay */}
      <ActionProcessingOverlay />
      
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Chats</h2>
          <Button
            onClick={onNewConversation}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        {conversations.length === 0 ? (
          <div className="p-6 text-center">
            <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">No conversations yet</p>
            <Button
              onClick={onNewConversation}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Start a new chat
            </Button>
          </div>
        ) : (
          <div className="p-2">
            {conversations.map((conversation) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className={`p-3 rounded-lg cursor-pointer mb-2 transition-colors ${
                  selectedConversationId === conversation.id
                    ? 'bg-blue-600'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-white">
                      {conversation.other_user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-white truncate">
                        {conversation.other_user.full_name || conversation.other_user.username}
                      </p>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-400">
                          {formatTime(conversation.last_message_at)}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0 rounded-full hover:bg-gray-700"
                            >
                              <MoreVertical className="h-4 w-4 text-gray-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent 
                            align="end"
                            className="w-48 bg-gray-900 border-gray-700 text-gray-100"
                          >
                            <DropdownMenuItem
                              className="flex items-center cursor-pointer hover:bg-gray-800"
                              onClick={(e) => handleClearChat(conversation.id, e)}
                            >
                              <Eraser className="mr-2 h-4 w-4 text-gray-400" />
                              <span>Clear chat</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="flex items-center text-red-500 cursor-pointer hover:bg-gray-800"
                              onClick={(e) => handleDeleteChat(conversation.id, e)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete chat</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <p className="text-xs text-gray-300 truncate">
                      {conversation.last_message || 'No messages yet'}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

export default ConversationsList
