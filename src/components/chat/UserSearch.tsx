
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, ArrowLeft, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

interface Profile {
  id: string
  username: string
  full_name: string | null
  status: string | null
}

interface UserSearchProps {
  onBack: () => void
  onConversationCreated: (conversationId: string) => void
}

const UserSearch: React.FC<UserSearchProps> = ({ onBack, onConversationCreated }) => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState<string | null>(null)

  const searchUsers = async (query: string) => {
    if (!query.trim() || !user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, status')
        .neq('id', user.id)
        .ilike('username', `%${query.trim()}%`)
        .limit(10)

      if (error) throw error
      setSearchResults(data || [])
    } catch (error) {
      console.error('Error searching users:', error)
      toast({
        title: 'Error',
        description: 'Failed to search users',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const createConversation = async (targetUserId: string) => {
    if (!user) return

    setCreating(targetUserId)
    try {
      // Check if conversation already exists
      const { data: existingConversation, error: checkError } = await supabase
        .from('participants')
        .select(`
          conversation_id,
          conversations!inner(id)
        `)
        .eq('user_id', user.id)

      if (checkError) throw checkError

      // Check if any of these conversations has the target user
      if (existingConversation && existingConversation.length > 0) {
        for (const participant of existingConversation) {
          const { data: targetParticipant } = await supabase
            .from('participants')
            .select('conversation_id')
            .eq('conversation_id', participant.conversation_id)
            .eq('user_id', targetUserId)
            .single()

          if (targetParticipant) {
            // Conversation already exists
            onConversationCreated(participant.conversation_id)
            return
          }
        }
      }

      // Create new conversation
      const { data: conversation, error: conversationError } = await supabase
        .from('conversations')
        .insert([{}])
        .select()
        .single()

      if (conversationError) throw conversationError

      // Add participants
      const { error: participantsError } = await supabase
        .from('participants')
        .insert([
          { conversation_id: conversation.id, user_id: user.id },
          { conversation_id: conversation.id, user_id: targetUserId }
        ])

      if (participantsError) throw participantsError

      onConversationCreated(conversation.id)
      toast({
        title: 'Conversation created',
        description: 'You can now start chatting!'
      })
    } catch (error) {
      console.error('Error creating conversation:', error)
      toast({
        title: 'Error',
        description: 'Failed to create conversation',
        variant: 'destructive'
      })
    } finally {
      setCreating(null)
    }
  }

  return (
    <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-xl font-semibold text-white">New Chat</h2>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search username..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              searchUsers(e.target.value)
            }}
            className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Search Results */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
          </div>
        ) : searchResults.length === 0 && searchQuery ? (
          <div className="p-6 text-center">
            <p className="text-gray-400">No users found</p>
          </div>
        ) : searchQuery ? (
          <div className="p-2">
            {searchResults.map((profile) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-gray-700 hover:bg-gray-600 mb-2 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-white">
                        {profile.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {profile.full_name || profile.username}
                      </p>
                      <p className="text-xs text-gray-400">@{profile.username}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => createConversation(profile.id)}
                    disabled={creating === profile.id}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {creating === profile.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <MessageCircle className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">Search for users to start a conversation</p>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

export default UserSearch
