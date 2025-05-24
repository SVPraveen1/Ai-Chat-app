
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { Edit3, Check, X, User, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { supabase } from '@/integrations/supabase/client'
import { messageBubbleVariants } from '@/animations/chatAnimations'

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
  const [isHovered, setIsHovered] = useState(false)
  const controls = useAnimation()

  useEffect(() => {
    controls.start('animate')
  }, [])

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
    const date = new Date(timestamp)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) {
      // Today - show time
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    } else if (diffInDays === 1) {
      // Yesterday
      return 'Yesterday'
    } else if (diffInDays < 7) {
      // Within a week - show day name
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      // Older - show date
      return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric'
      })
    }
  }

  return (
    <motion.div 
      className={cn('flex mb-4', isOwn ? 'justify-end' : 'justify-start')}
      initial="initial"
      animate={controls}
      variants={messageBubbleVariants(isOwn)}
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {!isOwn && (
        <motion.div 
          className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-2 self-end mb-1"
          animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
          transition={{ type: 'spring', stiffness: 500 }}
        >
          <Bot className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </motion.div>
      )}
      
      <motion.div
        className={cn(
          'rounded-2xl px-4 py-2 relative group',
          isOwn 
            ? 'bg-blue-600 text-white rounded-br-none' 
            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none',
          isOwn ? 'max-w-[80%]' : 'max-w-[75%]'
        )}
        animate={isHovered ? { y: -2 } : { y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div 
              key="edit"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center space-x-2"
            >
              <Input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="flex-1 bg/90 text-black dark:bg-gray-800/90"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={handleEdit}
                className="text-green-600 hover:bg-green-100 dark:hover:bg-green-900/50"
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(false)}
                className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50"
              >
                <X className="w-4 h-4" />
              </Button>
            </motion.div>
          ) : (
            <motion.div 
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start"
            >
              <div className="flex-1">
                <p className="whitespace-pre-wrap">{message.content}</p>
                <motion.p 
                  className="text-xs opacity-70 mt-1 flex items-center"
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: isHovered ? 1 : 0.7 }}
                  transition={{ duration: 0.2 }}
                >
                  {formatTime(message.created_at)}
                  {message.is_edited && (
                    <motion.span 
                      className="ml-1"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500 }}
                    >
                      (edited)
                    </motion.span>
                  )}
                </motion.p>
              </div>
              {isOwn && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ 
                    opacity: isHovered ? 1 : 0,
                    x: isHovered ? 0 : 10
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditText(message.content)
                      setIsEditing(true)
                    }}
                    className="text-gray-100 hover:bg-white/20 dark:text-gray-300 dark:hover:bg-white/10 p-1 h-6 w-6"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Message status indicator */}
        {isOwn && (
          <motion.div 
            className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-green-400"
            animate={{ 
              scale: isHovered ? [1, 1.5, 1] : 1,
              opacity: isHovered ? [0.7, 1, 0.7] : 1
            }}
            transition={{ 
              repeat: isHovered ? Infinity : 0,
              duration: 1.5,
              ease: 'easeInOut'
            }}
          />
        )}
      </motion.div>
      
      {isOwn && (
        <motion.div 
          className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center ml-2 self-end mb-1"
          animate={{ 
            scale: isHovered ? 1.1 : 1,
            rotate: isHovered ? 5 : 0
          }}
          transition={{ type: 'spring', stiffness: 500 }}
        >
          <User className="w-4 h-4 text-white" />
        </motion.div>
      )}
    </motion.div>
  )
}

export default MessageBubble
