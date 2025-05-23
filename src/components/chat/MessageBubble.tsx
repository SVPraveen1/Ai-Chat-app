
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Edit3, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/integrations/supabase/client'

interface Message {
  id: string
  content: string
  user_id: string
  conversation_id: string
  created_at: string
  is_edited?: boolean
  updated_at?: string
}

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(message.content)

  const handleEdit = async () => {
    if (editText.trim() === message.content) {
      setIsEditing(false)
      return
    }

    try {
      const { error } = await supabase
        .from('messages')
        .update({ 
          content: editText.trim(),
          is_edited: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', message.id)

      if (error) throw error
      setIsEditing(false)
    } catch (error) {
      console.error('Error editing message:', error)
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}
    >
      <div className={`max-w-xs lg:max-w-md relative ${isOwn ? 'order-2' : 'order-1'}`}>
        {!isOwn && (
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center mb-1">
            <span className="text-xs font-semibold text-white">U</span>
          </div>
        )}
        
        <div
          className={`px-4 py-2 rounded-lg ${
            isOwn
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
              : 'bg-slate-700 text-white'
          } shadow-lg`}
        >
          {isEditing ? (
            <div className="space-y-2">
              <Input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="bg-slate-800 border-slate-600 text-white"
                onKeyPress={(e) => e.key === 'Enter' && handleEdit()}
              />
              <div className="flex space-x-2">
                <Button size="sm" onClick={handleEdit} className="bg-blue-600 hover:bg-blue-700">
                  <Check className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false)
                    setEditText(message.content)
                  }}
                  className="border-slate-600 text-slate-300"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div 
                className="text-sm leading-relaxed break-words"
                dangerouslySetInnerHTML={{ 
                  __html: message.content.replace(/•\s*(.*?)(?=(\n•|\n\n|$))/gs, 
                    '<div class="flex mb-2"><span class="mr-1.5 text-purple-300 flex-shrink-0">•</span><span>$1</span></div>'
                  ) 
                }} 
              />
              {message.is_edited && (
                <p className="text-xs text-gray-300 mt-1 opacity-70">edited</p>
              )}
            </>
          )}
        </div>
        
        <div className={`flex items-center mt-1 space-x-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs text-gray-400">
            {formatTime(message.created_at)}
          </span>
          {isOwn && !isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white p-1 h-auto"
            >
              <Edit3 className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default MessageBubble
