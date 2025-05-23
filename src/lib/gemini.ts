import { GoogleGenerativeAI } from '@google/generative-ai'

// API key from environment variable or hardcoded fallback
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyDeDftQlvGxQwKLQ3_yODUpaWSW53yAU8Y'

// Initialize the API client with safety settings
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
  private model;
  private isInitialized = false;
  private backupText = "I apologize, but I couldn't process your request at this time. Please try again later.";
  
  constructor() {
    try {
      this.model = genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash',
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      });
      this.isInitialized = true;
      
      // Test API connectivity on initialization
      this.testApiConnectivity();
    } catch (error) {
      console.error("Failed to initialize Gemini model:", error);
      this.isInitialized = false;
    }
  }
  
  private async testApiConnectivity() {
    try {
      const testPrompt = "Say 'connection successful' if you can read this message.";
      const result = await this.model.generateContent(testPrompt);
      const response = await result.response;
      console.log("Gemini API connection test:", response.text().includes("connection successful") ? "Success" : "Partial success");
    } catch (error) {
      console.error("Gemini API connection test failed:", error);
      this.isInitialized = false;
    }
  }
  
  // Public method to retry connecting to API if it failed initially
  public async reconnect() {
    try {
      console.log("Attempting to reconnect to Gemini API...");
      this.model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      });
      
      // Try a simple test request
      const testPrompt = "Say 'reconnection successful' if you can read this message.";
      const result = await this.model.generateContent(testPrompt);
      const response = await result.response;
      
      const isSuccessful = response.text().includes("reconnection successful");
      this.isInitialized = isSuccessful;
      
      console.log("Gemini API reconnection:", isSuccessful ? "Success" : "Failed");
      return isSuccessful;
    } catch (error) {
      console.error("Failed to reconnect to Gemini API:", error);
      this.isInitialized = false;
      return false;
    }
  }

  async processText(text: string, action: string, context?: string): Promise<string> {
    if (!this.isInitialized) {
      console.warn('Gemini service not initialized, returning fallback response');
      return this.backupText;
    }
    
    // Determine if this action should use bullet points
    const useBulletPoints = action === 'summary' || action === 'expand' || action === 'analysis';
    
    if (!text || text.trim() === '') {
      return 'Please provide some text to process.';
    }
    
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

      try {
        const result = await this.model.generateContent(prompt)
        const response = await result.response
        const processedText = response.text().trim()
        
        // Format with bullet points if appropriate for this action type
        return useBulletPoints 
          ? this.formatTextWithBulletPoints(processedText || this.backupText, true)
          : (processedText || this.backupText);
      } catch (apiError) {
        console.error('Gemini API Error:', apiError);
        return `Sorry, I couldn't process the ${action} action. Please try again later.`;
      }
    } catch (error) {
      console.error('Error processing text with Gemini:', error)
      return this.backupText;
    }
  }

  async generateSuggestion(conversationHistory: string[], currentInput: string): Promise<string> {
    if (!this.isInitialized || !currentInput || currentInput.trim() === '') {
      return '';
    }
    
    try {
      const context = conversationHistory.slice(-5).join('\n')
      const prompt = `Based on this conversation context:
${context}

The user is writing: "${currentInput}"

Suggest a natural completion or improvement for their message. Make it sound conversational and contextually appropriate. Only return the suggested text, nothing else. Keep it under 100 words.`

      try {
        const result = await this.model.generateContent(prompt)
        const response = await result.response
        return response.text().trim()
      } catch (apiError) {
        console.error('Gemini API Error:', apiError);
        return '';
      }
    } catch (error) {
      console.error('Error generating suggestion:', error)
      return ''
    }
  }

  async generateSuggestionForSelectedText(selectedText: string, instructions: string): Promise<string> {
    if (!this.isInitialized || !selectedText || selectedText.trim() === '') {
      return '';
    }
    
    try {
      const prompt = `I have the following text:
"${selectedText}"

Based on these instructions or message idea:
"${instructions}"

Suggest an improved version of the selected text. Return only the modified text without any explanations.`

      try {
        const result = await this.model.generateContent(prompt)
        const response = await result.response
        return response.text().trim()
      } catch (apiError) {
        console.error('Gemini API Error:', apiError);
        return '';
      }
    } catch (error) {
      console.error('Error generating suggestion for selected text:', error)
      return ''
    }
  }

  async getChatResponse(userMessage: string, chatContext: string): Promise<string> {
    if (!this.isInitialized) {
      console.warn('Gemini service not initialized, returning fallback response');
      return this.backupText;
    }
    
    if (!userMessage || userMessage.trim() === '') {
      return 'I didn\'t receive a message. How can I help you?';
    }
    
    try {
      // Simplified prompt: AI should ONLY return the direct answer/content.
      const prompt = `You are an AI assistant. A user has sent the following message:
"${userMessage}"

Previous conversation context:
${chatContext}

Respond with ONLY the direct answer or requested content. Do NOT include any extra text, greetings, explanations, or conversational phrases like "Sure, I can help with that," or "Here is the information:". Just provide the core information or response.
If the query is informational (e.g., "what is X", "explain Y"), provide the answer as short, concise bullet points (using •). Each point should be brief.
Otherwise, provide the direct response.`;

      try {
        const result = await this.model.generateContent(prompt)
        const response = await result.response
        let chatResponse = response.text().trim()
        
        // Fallback if response is empty
        if (!chatResponse) {
          chatResponse = "I'm here to help! Could you rephrase your question?";
        }
        
        // The prompt now guides Gemini for bullet points, so direct formatting might not be needed
        // or can be simplified. For now, let's trust the prompt.
        // Consider if formatTextWithBulletPoints is still needed or if the prompt is sufficient.
        // Forcing bullet points if the original query seemed informational, as per new prompt.
        const lowercaseMessage = userMessage.toLowerCase();
        const isInformationalQuery = 
          lowercaseMessage.includes('what') || 
          lowercaseMessage.includes('how') || 
          lowercaseMessage.includes('why') || 
          lowercaseMessage.includes('explain') || 
          lowercaseMessage.includes('describe') ||
          lowercaseMessage.includes('meaning') || 
          lowercaseMessage.includes('definition');

        if (isInformationalQuery && !chatResponse.includes('•')) {
            // If it's informational and no bullets, try a simple split by sentence or new line.
            // This is a basic attempt if Gemini doesn't follow bullet instruction.
            const lines = chatResponse.split(/[.\n]/).filter(line => line.trim() !== '');
            if (lines.length > 1) {
                chatResponse = lines.map(line => `• ${line.trim()}`).join('\n');
            } else if (lines.length === 1) {
                chatResponse = `• ${lines[0].trim()}`;
            }
        }
        
        return chatResponse;
      } catch (apiError) {
        console.error('Gemini API Error:', apiError);
        return "Sorry, I'm having trouble connecting to my knowledge base right now. Please try again in a moment.";
      }
    } catch (error) {
      console.error('Error getting chat response:', error)
      return "I apologize, but I'm experiencing technical difficulties right now. Please try again later.";
    }
  }

  async analyzeConversation(messages: string[]): Promise<string> {
    if (!this.isInitialized || !messages || messages.length === 0) {
      return '• Unable to analyze conversation at the moment.';
    }
    
    try {
      const conversation = messages.slice(-10).join('\n');
      // Updated prompt for very short, precise, concise bullet points without explanation.
      const prompt = `Analyze this conversation:
${conversation}

Provide insights as EXTREMELY short and precise bullet points (using •). Each point should be a few words.
DO NOT explain anything. Just list the concise points. Focus on:
• Key topics (1-3 words)
• Overall sentiment (1-2 words)
• Dominant communication style (1-2 words)
• Actionable suggestions (if any, make it brief)

Example:
• Topic: Project Deadline
• Sentiment: Urgent
• Style: Formal
• Suggestion: Clarify roles`;

      try {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        let analysisText = response.text().trim();
        
        // Ensure it's formatted with bullet points if not already
        if (!analysisText.includes('•') && analysisText) {
            const points = analysisText.split('\n').filter(pt => pt.trim() !== '');
            if (points.length > 0) {
                analysisText = points.map(pt => `• ${pt.trim()}`).join('\n');
            } else {
                analysisText = "• No specific insights generated.";
            }
        } else if (!analysisText) {
             analysisText = "• Unable to generate insights at this time.";
        }
        
        return analysisText;
      } catch (apiError) {
        console.error('Gemini API Error:', apiError);
        return '• Unable to analyze: API error.';
      }
    } catch (error) {
      console.error('Error analyzing conversation:', error);
      return '• Unable to analyze: System error.';
    }
  }

  async translateText(text: string, targetLanguage: string, context?: string): Promise<string> {
    if (!this.isInitialized) {
      return this.backupText;
    }
    
    if (!text || text.trim() === '' || !targetLanguage) {
      return 'Please provide both text to translate and a target language.';
    }
    
    try {
      let prompt = `Translate this text to ${targetLanguage}:
"${text}"

Important: Return ONLY the translated text without any explanations, notes, or formatting. No introduction, no quotation marks surrounding the translation, just the pure translated text.`

      if (context) {
        prompt += `\n\nContext from recent conversation for tone reference (but do not translate this context, just use it for understanding tone):
${context}`
      }

      try {
        const result = await this.model.generateContent(prompt)
        const response = await result.response
        const translatedText = response.text().trim()
        return translatedText || `Sorry, I couldn't translate to ${targetLanguage} at the moment.`;
      } catch (apiError) {
        console.error('Gemini API Error:', apiError);
        return `Sorry, I couldn't translate to ${targetLanguage} at the moment.`;
      }
    } catch (error) {
      console.error('Error translating text:', error)
      return `Sorry, I couldn't translate to ${targetLanguage} at the moment.`;
    }
  }

  async enhanceMessage(message: string, context: string[]): Promise<string> {
    if (!this.isInitialized) {
      return this.backupText;
    }
    
    if (!message || message.trim() === '') {
      return 'Please provide a message to enhance.';
    }
    
    try {
      const conversationContext = context && context.length > 0 ? context.slice(-3).join('\n') : '';
      const prompt = `Enhance this message to make it more engaging and clear:
"${message}"

${conversationContext ? `Context from recent conversation:
${conversationContext}` : ''}

Improve the message while keeping the original intent. Make it more natural and conversational.`

      try {
        const result = await this.model.generateContent(prompt)
        const response = await result.response
        const enhancedMessage = response.text().trim()
        return enhancedMessage || message;  // Return original if enhancement fails
      } catch (apiError) {
        console.error('Gemini API Error:', apiError);
        return message;  // Return original message on API error
      }
    } catch (error) {
      console.error('Error enhancing message:', error)
      return message;  // Return original message on any error
    }
  }

  async processTextWithInstructions(text: string, instructions: string): Promise<string> {
    if (!this.isInitialized) {
      return this.backupText;
    }
    
    if (!text || text.trim() === '' || !instructions || instructions.trim() === '') {
      return 'Please provide both text and instructions.';
    }
    
    try {
      const prompt = `I have the following text:
"${text}"

Apply these changes to it:
"${instructions}"

Return only the modified text, without any explanations or additional content.`

      try {
        const result = await this.model.generateContent(prompt)
        const response = await result.response
        const processedText = response.text().trim() || "I couldn't apply your instructions. Please try with different wording.";
        
        // Check if instructions mention bullet points, list, or points
        const wantsBulletPoints = 
          instructions.toLowerCase().includes('bullet') || 
          instructions.toLowerCase().includes('list') || 
          instructions.toLowerCase().includes('points');
          
        return wantsBulletPoints 
          ? this.formatTextWithBulletPoints(processedText, true)
          : processedText;
      } catch (apiError) {
        console.error('Gemini API Error:', apiError);
        return "Sorry, I couldn't process your instructions. The AI service may be temporarily unavailable.";
      }
    } catch (error) {
      console.error('Error processing text with instructions:', error)
      return "Sorry, I couldn't process your instructions. Please try again later.";
    }
  }
  
  // Helper function to format text with bullet points if needed
  private formatTextWithBulletPoints(text: string, forceFormat: boolean = false): string {
    // Check if text already contains bullet points
    const hasBulletPoints = text.includes('•') || text.includes('- ') || text.includes('* ');
    
    if (hasBulletPoints || !forceFormat) {
      return text;
    }

    // If text should be bullet points but isn't, convert paragraphs to bullets
    const paragraphs = text.split('\n\n').filter(p => p.trim() !== '');
    if (paragraphs.length > 1) {
      return paragraphs.map(p => `• ${p.trim()}`).join('\n\n');
    }
    
    return text;
  }
}

export const geminiService = new GeminiService()
