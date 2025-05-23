import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Bot, Wand2, MessageSquare, Lightbulb, ChevronDown, ChevronUp, 
  Globe, FileText, Zap, Sparkles, Send, Brain, Cpu, Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
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
  const [mainTab, setMainTab] = useState<'features' | 'copilot'>('features')
  const [activeSection, setActiveSection] = useState<'actions' | 'suggestions' | 'analysis'>('actions')
  const [isProcessing, setIsProcessing] = useState(false)
  const [suggestion, setSuggestion] = useState('')
  const [analysis, setAnalysis] = useState('')
  const [smartInput, setSmartInput] = useState('')
  const [showTranslateInput, setShowTranslateInput] = useState(false)
  const [targetLanguage, setTargetLanguage] = useState('')
  
  // States for AI Copilot chat functionality
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([])
  const [chatInput, setChatInput] = useState('')
  
  const { toast } = useToast()
  const suggestionTimeoutRef = useRef<NodeJS.Timeout>()
  const chatEndRef = useRef<HTMLDivElement>(null)

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
  }, [currentInput, selectedText])

  useEffect(() => {
    if (conversationHistory.length > 2) {
      generateAnalysis()
    }
  }, [conversationHistory])

  // Scroll to bottom when new chat messages are added
  useEffect(() => {
    if (mainTab === 'copilot' && chatMessages.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages, mainTab])

  // We don't need to automatically generate summary when text is selected anymore
  // Summary will be generated only when the user clicks the Summarize action

  const generateSmartSuggestion = async () => {
    try {
      // If there's selected text, get suggestions specifically for that text
      if (selectedText) {
        const result = await geminiService.generateSuggestionForSelectedText(selectedText, currentInput)
        setSuggestion(result)
      } else {
        // Otherwise use the original behavior
        const result = await geminiService.generateSuggestion(conversationHistory, currentInput)
        setSuggestion(result)
      }
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

  // Function to handle chat with AI copilot
  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return
    
    const userMessage = chatInput.trim()
    setChatInput('')
    
    // Add user message to chat
    setChatMessages(prev => [...prev, { role: 'user' as const, content: userMessage }])
    
    // Show processing state
    setIsProcessing(true)
    
    try {
      // Create context from previous messages for better responses
      const contextMessages = chatMessages
        .slice(-6)
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n')
      
      // Get response from AI
      const aiResponse = await geminiService.getChatResponse(userMessage, contextMessages)
      
      // Add AI response to chat
      setChatMessages(prev => [...prev, { role: 'assistant' as const, content: aiResponse }])
      
      // Scroll to bottom
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
      
    } catch (error) {
      console.error('Error getting AI response:', error)
      toast({
        title: 'Error',
        description: 'Failed to get a response from AI',
        variant: 'destructive'
      })
      
      // Add error message to chat
      setChatMessages(prev => [...prev, { 
        role: 'assistant' as const, 
        content: 'Sorry, I had trouble processing that request. Could you try asking in a different way?' 
      }])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleTranslate = async (language: string) => {
    if (!selectedText) {
      toast({
        title: 'No text selected',
        description: 'Please select some text to translate',
        variant: 'destructive'
      })
      return
    }

    setIsProcessing(true)
    try {
      const result = await geminiService.translateText(
        selectedText,
        language,
        conversationHistory.slice(-3).join('\n')
      )
      
      onReplaceText(result)
      
      toast({
        title: 'Translation Complete',
        description: `Successfully translated to ${language}`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to translate text',
        variant: 'destructive'
      })
    } finally {
      setIsProcessing(false)
      setShowTranslateInput(false)
      setTargetLanguage('')
    }
  }

  const handleAIAction = async (actionId: string) => {
    // Skip translate as it's handled separately
    if (actionId === 'translate') {
      setShowTranslateInput(true)
      return
    }
    
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
        ? (selectedText && selectedText.length > 50 ? selectedText : conversationHistory.slice(-5).join('\n'))
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
    
    if (!selectedText) {
      toast({
        title: 'No text selected',
        description: 'Please select the text you want to modify',
        variant: 'destructive'
      })
      return
    }

    setIsProcessing(true)
    try {
      // Pass the selectedText and smartInput as instructions to process the text
      const result = await geminiService.processTextWithInstructions(selectedText, smartInput)
      onReplaceText(result)
      setSmartInput('')
      toast({
        title: 'Changes applied',
        description: 'Your selected text has been modified according to your instructions',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to apply changes to the selected text',
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
      className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col h-full overflow-hidden"
    >
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <div className="p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-700/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">AI Copilot</h3>
                  <p className="text-xs text-gray-400">Intelligent assistance</p>
                </div>
                <Sparkles className="w-5 h-5 text-purple-400 ml-1" />
              </div>
              {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="overflow-hidden flex flex-col">
          {/* Main Tabs */}
          <div className="flex bg-gray-700 p-1 mx-4 mt-3 mb-2 rounded-lg shadow-md">
            {[
              { id: 'features', label: 'AI Features', icon: Cpu },
              { id: 'copilot', label: 'AI Copilot', icon: Brain }
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={mainTab === tab.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setMainTab(tab.id as any)}
                className={`flex-1 text-sm px-3 py-2 ${
                  mainTab === tab.id 
                    ? 'bg-purple-600 text-white shadow-lg' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-600/50'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-1.5" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </Button>
            ))}
          </div>
          
          {/* Feature Tabs - Only visible when in Features tab */}
          {mainTab === 'features' && (
            <div className="flex bg-gray-700/50 p-1 mx-4 mb-2 rounded-lg">
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
                  className={`flex-1 text-sm px-2 py-1 ${
                    activeSection === tab.id 
                      ? 'bg-purple-500/70 text-white' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-600/50'
                  }`}
                >
                  <tab.icon className="w-3 h-3 mr-1" />
                  <span className="whitespace-nowrap text-xs">{tab.label}</span>
                </Button>
              ))}
            </div>
          )}

          <ScrollArea className="flex-1 px-4 pb-4 overflow-hidden">
            <div className="pt-2"> {/* Added padding top for consistent spacing */}
            </div>
            {/* Chat interface when copilot tab is selected */}
            {mainTab === 'copilot' ? (
              <div className="flex flex-col h-full space-y-4">
                {/* Empty state for no messages */}
                {chatMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <Bot className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-medium text-white">AI Copilot</h3>
                    <p className="text-sm text-gray-400 max-w-[250px]">
                      I'm your AI assistant. Ask me anything about this chat app or any other questions you have.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 mb-2">
                    {chatMessages.map((msg, index) => (
                      <div 
                        key={index} 
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[90%] p-3 rounded-lg ${
                            msg.role === 'user' 
                              ? 'bg-purple-600 text-white' 
                              : 'bg-gray-700 border border-gray-600 text-gray-200'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                          {msg.role === 'assistant' && (
                            <div className="mt-2 text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onInsertText(msg.content)}
                                className="text-xs bg-gray-600 hover:bg-gray-500 text-gray-100 border-gray-600"
                              >
                                <MessageSquare className="w-3 h-3 mr-1" />
                                Insert to Chat
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Selected Text Display - Only shown in Features tab */}
                {selectedText && (
                  <Card className="mb-4 bg-gray-700 border-gray-600 shadow-md">
                    <CardContent className="p-3">
                      <p className="text-sm font-medium text-purple-300 mb-2 flex items-center">
                        <span className="w-1.5 h-4 bg-purple-500 rounded-full mr-2"></span>
                        Selected text:
                      </p>
                      <div className="overflow-hidden rounded">
                        <p className="text-sm text-gray-300 bg-gray-800 p-3 border-l-2 border-purple-500 max-h-36 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-600/40 scrollbar-track-transparent break-words">
                          "{selectedText}"
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
            
                {/* AI Actions - Only shown in Features tab */}
                {activeSection === 'actions' && (
              <div className="space-y-3">
                <h4 className="text-base font-medium text-gray-300 mb-2 flex items-center">
                  <Wand2 className="w-5 h-5 mr-2 text-purple-400" />
                  Available AI Actions
                </h4>
                <div className="max-h-[calc(100vh-240px)] overflow-y-auto pr-1 space-y-2.5 scrollbar-thin scrollbar-thumb-purple-600/40 scrollbar-track-gray-800 pb-2">
                  {AI_ACTIONS.map((action) => 
                    action.id === 'translate' ? (
                      <div key={action.id} className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowTranslateInput(!showTranslateInput)}
                          disabled={isProcessing}
                          className="h-auto p-3 bg-gray-700/50 border border-gray-600 hover:border-purple-500 text-gray-300 hover:bg-gray-700 hover:text-white text-left flex items-center w-full transition-all duration-200 rounded-lg hover:translate-x-1"
                        >
                          <span className="mr-3 text-xl flex-shrink-0 w-9 h-9 flex items-center justify-center bg-gray-800 rounded-full">{action.icon}</span>
                          <div className="flex flex-col overflow-hidden">
                            <span className="font-medium text-base text-white truncate">{action.label}</span>
                            <span className="text-sm text-gray-400 leading-tight truncate">{action.description}</span>
                          </div>
                        </Button>
                        
                        {showTranslateInput && (
                          <Card className="bg-gray-800 border-gray-700 p-2">
                            <CardContent className="p-2 space-y-3">
                              <div className="flex flex-col space-y-2">
                                <label className="text-sm font-medium text-gray-300">Translate to:</label>
                                <Input
                                  value={targetLanguage}
                                  onChange={(e) => setTargetLanguage(e.target.value)}
                                  placeholder="Enter language name"
                                  className="bg-gray-700 border-gray-600 text-white"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-1 mt-1">
                                {['Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Hindi', 'Arabic', 'Russian'].map((lang) => (
                                  <Button
                                    key={lang}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setTargetLanguage(lang)}
                                    className="text-xs justify-start h-7 px-2 text-gray-300 hover:text-white hover:bg-gray-700"
                                  >
                                    {lang}
                                  </Button>
                                ))}
                              </div>
                              <div className="flex justify-between space-x-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setShowTranslateInput(false)
                                    setTargetLanguage('')
                                  }}
                                  className="text-gray-300"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    if (targetLanguage.trim()) {
                                      handleTranslate(targetLanguage)
                                    } else {
                                      toast({
                                        title: 'Language Required',
                                        description: 'Please enter a target language',
                                        variant: 'destructive'
                                      })
                                    }
                                  }}
                                  disabled={isProcessing || !targetLanguage.trim()}
                                  className="bg-purple-600 hover:bg-purple-700"
                                >
                                  Translate
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    ) : (
                      <Button
                        key={action.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleAIAction(action.id)}
                        disabled={isProcessing}
                        className="h-auto p-3 bg-gray-700/50 border border-gray-600 hover:border-purple-500 text-gray-300 hover:bg-gray-700 hover:text-white text-left flex items-center w-full transition-all duration-200 rounded-lg hover:translate-x-1"
                      >
                        <span className="mr-3 text-xl flex-shrink-0 w-9 h-9 flex items-center justify-center bg-gray-800 rounded-full">{action.icon}</span>
                        <div className="flex flex-col overflow-hidden">
                          <span className="font-medium text-base text-white truncate">{action.label}</span>
                          <span className="text-sm text-gray-400 leading-tight truncate">{action.description}</span>
                        </div>
                      </Button>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Smart Suggestions */}
            {activeSection === 'suggestions' && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-300 flex items-center mb-2">
                  <Lightbulb className="w-4 h-4 mr-1" />
                  Smart Suggestions
                </h4>
                
                <Card className="bg-gray-700 border-gray-600">
                  <CardContent className="p-3">
                    <p className="text-sm text-gray-300 mb-2">Describe changes for selected text:</p>
                    <Textarea
                      value={smartInput}
                      onChange={(e) => setSmartInput(e.target.value)}
                      placeholder="Enter instructions like 'make it more formal' or 'translate to Spanish'..."
                      className="bg-gray-800 border-gray-600 text-white text-sm mb-2 min-h-[60px] resize-none"
                    />
                    <Button
                      size="sm"
                      onClick={handleSmartInputSubmit}
                      disabled={!smartInput.trim() || isProcessing}
                      className="bg-purple-600 hover:bg-purple-700 w-full"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      Apply Changes
                    </Button>
                  </CardContent>
                </Card>

                {suggestion && (
                  <Card className="bg-gray-700 border-gray-600">
                    <CardContent className="p-3">
                      <p className="text-sm text-gray-300 mb-2">AI has suggested this:</p>
                      <div className="max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-600/40 scrollbar-track-transparent">
                        <p className="text-sm text-gray-300 bg-gray-800 p-2 rounded mb-2 break-words">{suggestion}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => onReplaceText(suggestion)}
                        className="bg-green-600 hover:bg-green-700 w-full mt-2"
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
                        <div className="w-full overflow-hidden">
                          <p className="text-sm font-medium text-blue-300 mb-1">Analysis</p>
                          <div className="max-h-[400px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-purple-600/40 scrollbar-track-transparent">
                            <p className="text-sm text-gray-300 leading-relaxed break-words">{analysis}</p>
                          </div>
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

            {/* Chat Interface - New Feature */}
            <div className="mt-4">
              <div className="bg-gray-800 p-3 rounded-lg shadow-md">
                <div className="flex flex-col space-y-3">
                  <div className="text-sm text-gray-400">
                    <p className="font-medium text-gray-300">AI Copilot Chat</p>
                    <p>Ask questions or get assistance with your text.</p>
                  </div>
                  
                  {/* Chat Messages */}
                  <div className="max-h-[200px] overflow-y-auto pr-3 scrollbar-thin scrollbar-thumb-purple-600/40 scrollbar-track-transparent">
                    {chatMessages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-2`}>
                        <div className={`max-w-xs rounded-lg px-4 py-2 text-sm ${msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {/* chatEndRef should be inside the scrollable div if it's meant to scroll to the last message */}
                    <div ref={chatEndRef} /> 
                  </div> {/* This div was missing its closing tag for chat messages */}

                  {/* Chat Input Area */}
                  <div className="flex">
                    <Textarea
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Type your message..."
                      className="bg-gray-700 border-gray-600 text-white text-sm resize-none pr-10"
                      // Add onKeyPress for Enter to submit, if desired
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleChatSubmit();
                        }
                      }}
                    />
                    <Button
                      onClick={handleChatSubmit}
                      disabled={isProcessing || !chatInput.trim()} // Disable if no input
                      className="bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg ml-2"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            </> // This closes the fragment for mainTab !== 'copilot'
            )} 
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>
    </motion.div>
  );
}

export default AICopilot;
