
import { GoogleGenerativeAI } from '@google/generative-ai'

const API_KEY = 'AIzaSyCJicaavuaFamSVALIv_YahabcQ344rGGc'
const genAI = new GoogleGenerativeAI(API_KEY)

export interface AIAction {
  id: string
  label: string
  description: string
  icon: string
}

export const AI_ACTIONS: AIAction[] = [
  { id: 'formal', label: 'Make Formal', description: 'Convert to professional tone', icon: '🎯' },
  { id: 'friendly', label: 'Make Friendly', description: 'Convert to casual, friendly tone', icon: '😊' },
  { id: 'translate', label: 'Translate', description: 'Translate to different languages', icon: '🌐' },
  { id: 'grammar', label: 'Fix Grammar', description: 'Correct grammar and spelling', icon: '✅' },
  { id: 'rephrase', label: 'Rephrase', description: 'Rewrite with better clarity', icon: '✍️' },
  { id: 'concise', label: 'Make Concise', description: 'Shorten while keeping meaning', icon: '✂️' },
  { id: 'expand', label: 'Expand', description: 'Add more detail and context', icon: '📝' },
  { id: 'summary', label: 'Summarize', description: 'Create instant summary', icon: '📋' }
]

class GeminiService {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  async processText(text: string, action: string, context?: string): Promise<string> {
    try {
      let prompt = ''
      
      switch (action) {
        case 'formal':
          prompt = `Convert this text to a formal, professional tone while maintaining the original meaning: "${text}"`
          break
        case 'friendly':
          prompt = `Convert this text to a friendly, casual tone while keeping the core message: "${text}"`
          break
        case 'translate':
          prompt = `Translate this text to Spanish (if it's in English) or English (if it's in another language): "${text}"`
          break
        case 'grammar':
          prompt = `Fix all grammar, spelling, and punctuation errors in this text while preserving the original meaning: "${text}"`
          break
        case 'rephrase':
          prompt = `Rephrase this text to be clearer and more engaging while keeping the same meaning: "${text}"`
          break
        case 'concise':
          prompt = `Make this text more concise and to the point while preserving all important information: "${text}"`
          break
        case 'expand':
          prompt = `Expand this text with more detail, examples, and context to make it more comprehensive: "${text}"`
          break
        case 'summary':
          prompt = `Create a clear, concise summary of this text highlighting the main points: "${text}"`
          break
        default:
          prompt = `Improve this text to make it better: "${text}"`
      }

      if (context) {
        prompt += `\n\nConversation context: ${context}`
      }

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text().trim()
    } catch (error) {
      console.error('Error processing text with Gemini:', error)
      throw new Error('Failed to process text with AI')
    }
  }

  async generateSuggestion(conversationHistory: string[], currentInput: string): Promise<string> {
    try {
      const context = conversationHistory.slice(-5).join('\n')
      const prompt = `Based on this conversation context:
${context}

The user is writing: "${currentInput}"

Suggest a natural completion or improvement for their message. Make it sound conversational and contextually appropriate. Only return the suggested text, nothing else. Keep it under 100 words.`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text().trim()
    } catch (error) {
      console.error('Error generating suggestion:', error)
      return ''
    }
  }

  async generateSuggestionForSelectedText(selectedText: string, instructions: string): Promise<string> {
    try {
      const prompt = `I have the following text:
"${selectedText}"

Based on these instructions or message idea:
"${instructions}"

Suggest an improved version of the selected text. Return only the modified text without any explanations.`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text().trim()
    } catch (error) {
      console.error('Error generating suggestion for selected text:', error)
      return ''
    }
  }

  async analyzeConversation(messages: string[]): Promise<string> {
    try {
      const conversation = messages.slice(-10).join('\n')
      const prompt = `Analyze this conversation and provide helpful insights:
${conversation}

Provide a brief analysis focusing on:
1. Main topics discussed
2. Overall tone and sentiment
3. Communication style
4. Any helpful suggestions for better engagement

Keep the analysis under 150 words and make it actionable.`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text().trim()
    } catch (error) {
      console.error('Error analyzing conversation:', error)
      return 'Unable to analyze conversation at the moment.'
    }
  }

  async enhanceMessage(message: string, context: string[]): Promise<string> {
    try {
      const conversationContext = context.slice(-3).join('\n')
      const prompt = `Enhance this message to make it more engaging and clear:
"${message}"

Context from recent conversation:
${conversationContext}

Improve the message while keeping the original intent. Make it more natural and conversational.`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text().trim()
    } catch (error) {
      console.error('Error enhancing message:', error)
      throw new Error('Failed to enhance message')
    }
  }

  async processTextWithInstructions(text: string, instructions: string): Promise<string> {
    try {
      const prompt = `I have the following text:
"${text}"

Apply these changes to it:
"${instructions}"

Return only the modified text, without any explanations or additional content.`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text().trim()
    } catch (error) {
      console.error('Error processing text with instructions:', error)
      throw new Error('Failed to process text with custom instructions')
    }
  }
}

export const geminiService = new GeminiService()
