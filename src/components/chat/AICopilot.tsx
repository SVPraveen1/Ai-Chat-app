
import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Bot, Wand2, MessageSquare, Lightbulb, ChevronDown, ChevronUp, Globe, FileText, Zap, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { geminiService } from '@/lib/gemini'

const AI_ACTIONS = [
  {
    id: 'formal',
    label: 'Make Formal',
    description: 'Convert to professional tone',
    icon: '🎯'
  },
  {
    id: 'friendly',
    label: 'Make Friendly',
    description: 'Convert to casual, friendly tone',
    icon: '😊'
  },
  {
    id: 'translate',
    label: 'Translate',
    description: 'Translate to different languages',
    icon: '🌐'
  },
  {
    id: 'grammar',
    label: 'Fix Grammar',
    description: 'Correct grammar and spelling',
    icon: '✅'
  },
  {
    id: 'rephrase',
    label: 'Rephrase',
    description: 'Rewrite with better clarity',
    icon: '✍️'
  },
  {
    id: 'concise',
    label: 'Make Concise',
    description: 'Shorten while keeping meaning',
    icon: '✂️'
  },
  {
    id: 'expand',
    label: 'Expand',
    description: 'Add more detail and context',
    icon: '📝'
  },
  {
    id: 'summary',
    label: 'Summarize',
    description: 'Create instant summary',
    icon: '📋'
  }
]

interface AICopilotProps {
  selectedText: string
  onInsertText: (text: string) => void
  onReplaceText: (text: string) => void
  conversationHistory: string[]
  currentInput: string
}

const AICopilot: React.FC<AICopilotProps> = ({
  selectedText,
  onInsertText,
  onReplaceText,
  conversationHistory,
  currentInput
}) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [activeSection, setActiveSection] = useState<'actions' | 'suggestions' | 'analysis'>('actions')
  const [isProcessing, setIsProcessing] = useState(false)
  const [suggestion, setSuggestion] = useState('')
  const [analysis, setAnalysis] = useState('')
  const [smartInput, setSmartInput] = useState('')
  const [instantSummary, setInstantSummary] = useState('')
  const { toast } = useToast()
  const suggestionTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (currentInput.length > 15) {
      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current)
      }
      suggestionTimeoutRef.current = setTimeout(() => {
        generateSmartSuggestion()
      }, 1000)
    }
    return () => {
      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current)
      }
    }
  }, [currentInput])

  useEffect(() => {
    if (conversationHistory.length > 2) {
      generateAnalysis()
    }
  }, [conversationHistory])

  useEffect(() => {
    if (selectedText) {
      generateInstantSummary()
    }
  }, [selectedText])

  const generateSmartSuggestion = async () => {
    try {
      const result = await geminiService.generateSuggestion(conversationHistory, currentInput)
      setSuggestion(result)
    } catch (error) {
      console.error('Error generating suggestion:', error)
    }
  }

  const generateAnalysis = async () => {
    try {
      const result = await geminiService.analyzeConversation(conversationHistory.slice(-10))
      setAnalysis(result)
    } catch (error) {
      console.error('Error analyzing conversation:', error)
    }
  }

  const generateInstantSummary = async () => {
    if (!selectedText || selectedText.length < 50) return
    
    try {
      const result = await geminiService.processText(selectedText, 'summary', '')
      setInstantSummary(result)
    } catch (error) {
      console.error('Error generating summary:', error)
    }
  }

  const handleAIAction = async (actionId: string) => {
    if (!selectedText && actionId !== 'summary') {
      toast({
        title: 'No text selected',
        description: 'Please select some text to perform this action',
        variant: 'destructive'
      })
      return
    }

    setIsProcessing(true)
    try {
      const textToProcess = actionId === 'summary' 
        ? conversationHistory.slice(-5).join('\n') 
        : selectedText

      const result = await geminiService.processText(
        textToProcess,
        actionId,
        conversationHistory.slice(-3).join('\n')
      )

      if (actionId === 'summary') {
        onInsertText(`\n\n**Summary:** ${result}`)
      } else {
        onReplaceText(result)
      }

      toast({
        title: 'AI Action Complete',
        description: `Successfully ${actionId === 'summary' ? 'generated summary' : 'processed text'}`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process text with AI',
        variant: 'destructive'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSmartInputSubmit = async () => {
    if (!smartInput.trim()) return

    setIsProcessing(true)
    try {
      const result = await geminiService.generateSuggestion(conversationHistory, smartInput)
      onReplaceText(result)
      setSmartInput('')
      toast({
        title: 'Smart suggestion applied',
        description: 'Your message has been enhanced with AI',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate smart suggestion',
        variant: 'destructive'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col h-full"
    >
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <div className="p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-white">AI Copilot</h3>
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
              {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="flex bg-gray-700 p-1 m-4 rounded-lg">
            {[
              { id: 'actions', label: 'Actions', icon: Wand2 },
              { id: 'suggestions', label: 'Smart', icon: Lightbulb },
              { id: 'analysis', label: 'Insights', icon: MessageSquare }
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeSection === tab.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveSection(tab.id as any)}
                className={`flex-1 text-xs ${
                  activeSection === tab.id 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <tab.icon className="w-3 h-3 mr-1" />
                {tab.label}
              </Button>
            ))}
          </div>

          <ScrollArea className="flex-1 px-4 pb-4 max-h-[calc(100vh-200px)]">
            {/* Instant Summary for Selected Text */}
            {selectedText && instantSummary && (
              <Card className="mb-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/20">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="w-4 h-4 text-purple-400" />
                    <p className="text-sm font-medium text-purple-300">Instant Summary</p>
                  </div>
                  <p className="text-xs text-gray-300 mb-2">{instantSummary}</p>
                  <Button
                    size="sm"
                    onClick={() => onInsertText(`\n\n**Summary:** ${instantSummary}`)}
                    className="bg-purple-600 hover:bg-purple-700 text-xs"
                  >
                    Insert Summary
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Selected Text Display */}
            {selectedText && (
              <Card className="mb-4 bg-gray-700 border-gray-600">
                <CardContent className="p-3">
                  <p className="text-sm text-purple-300 mb-1">Selected text:</p>
                  <p className="text-xs text-gray-300 bg-gray-800 p-2 rounded border-l-2 border-purple-500 max-h-20 overflow-y-auto">
                    "{selectedText}"
                  </p>
                </CardContent>
              </Card>
            )}

            {/* AI Actions */}
            {activeSection === 'actions' && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
                  <Wand2 className="w-4 h-4 mr-1" />
                  Text Actions
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {AI_ACTIONS.map((action) => (
                    <Button
                      key={action.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleAIAction(action.id)}
                      disabled={isProcessing}
                      className="h-auto p-2 bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white text-left flex flex-col items-start"
                    >
                      <div className="flex items-center w-full mb-1">
                        <span className="mr-1 text-sm">{action.icon}</span>
                        <span className="font-medium text-xs">{action.label}</span>
                      </div>
                      <span className="text-xs opacity-70 leading-tight">{action.description}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Smart Suggestions */}
            {activeSection === 'suggestions' && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-300 flex items-center">
                  <Lightbulb className="w-4 h-4 mr-1" />
                  Smart Suggestions
                </h4>
                
                <Card className="bg-gray-700 border-gray-600">
                  <CardContent className="p-3">
                    <p className="text-sm text-gray-300 mb-2">Ask AI to improve your message:</p>
                    <Textarea
                      value={smartInput}
                      onChange={(e) => setSmartInput(e.target.value)}
                      placeholder="Type your message idea here..."
                      className="bg-gray-800 border-gray-600 text-white text-sm mb-2 min-h-[60px]"
                    />
                    <Button
                      size="sm"
                      onClick={handleSmartInputSubmit}
                      disabled={!smartInput.trim() || isProcessing}
                      className="bg-purple-600 hover:bg-purple-700 w-full"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      Enhance with AI
                    </Button>
                  </CardContent>
                </Card>

                {suggestion && (
                  <Card className="bg-gray-700 border-gray-600">
                    <CardContent className="p-3">
                      <p className="text-sm text-gray-300 mb-2">Suggested enhancement:</p>
                      <p className="text-sm text-gray-300 bg-gray-800 p-2 rounded mb-2">{suggestion}</p>
                      <Button
                        size="sm"
                        onClick={() => onReplaceText(suggestion)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Use Suggestion
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Conversation Analysis */}
            {activeSection === 'analysis' && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-300 flex items-center">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Conversation Insights
                </h4>
                {analysis ? (
                  <Card className="bg-gray-700 border-gray-600">
                    <CardContent className="p-3">
                      <div className="flex items-start space-x-2">
                        <FileText className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-blue-300 mb-1">Analysis</p>
                          <p className="text-sm text-gray-300 leading-relaxed">{analysis}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <p className="text-sm text-gray-400">Continue the conversation to get AI insights...</p>
                )}
              </div>
            )}

            {/* Processing Indicator */}
            {isProcessing && (
              <div className="mt-4 p-3 bg-purple-900/20 border border-purple-500/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
                  <span className="text-sm text-purple-300">AI is processing...</span>
                </div>
              </div>
            )}
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>
    </motion.div>
  )
}

export default AICopilot
