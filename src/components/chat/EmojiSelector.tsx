
import React from 'react'
import { Card } from '@/components/ui/card'

interface EmojiSelectorProps {
  onEmojiSelect: (emoji: string) => void
}

const EmojiSelector: React.FC<EmojiSelectorProps> = ({ onEmojiSelect }) => {
  const commonEmojis = [
    '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂',
    '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛',
    '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
    '😒', '😞', '😔', '😟', '😕', '🙁', '😣', '😖', '😫', '😩',
    '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔'
  ]

  return (
    <Card className="bg-slate-700 border-slate-600 p-3 w-64 max-h-48 overflow-y-auto">
      <div className="grid grid-cols-8 gap-1">
        {commonEmojis.map((emoji, index) => (
          <button
            key={index}
            onClick={() => onEmojiSelect(emoji)}
            className="text-lg hover:bg-slate-600 rounded p-1 transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>
    </Card>
  )
}

export default EmojiSelector
