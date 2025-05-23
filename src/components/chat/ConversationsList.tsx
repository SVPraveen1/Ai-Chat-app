
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

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

  if (loading) {
    return (
      <div className="w-80 bg-gray-800 border-r border-gray-700 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Chats</h2>
          <Button
            onClick={onNewConversation}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        {conversations.length === 0 ? (
          <div className="p-6 text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No conversations yet</p>
            <Button
              onClick={onNewConversation}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
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
                    ? 'bg-purple-600'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-white">
                      {conversation.other_user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-white truncate">
                        {conversation.other_user.full_name || conversation.other_user.username}
                      </p>
                      <span className="text-xs text-gray-400">
                        {formatTime(conversation.last_message_at)}
                      </span>
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
