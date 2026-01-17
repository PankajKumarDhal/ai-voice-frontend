# Voice Chat AI Application

A professional voice chat AI application that replicates the functionality of Revolt Motors' voice chat system using React.js frontend and Node.js backend with Gemini Live API integration.

## Features

### Core Functionality
- **Real-time Voice Chat**: Natural conversation flow with AI assistant
- **Interruption Support**: Users can interrupt AI while speaking
- **Low Latency**: 1-2 second response time for optimal user experience
- **Multi-language Support**: Handles various languages through Gemini API
- **Professional UI**: Clean, responsive interface with smooth animations

### Technical Features
- **WebSocket Communication**: Real-time bidirectional communication
- **Audio Processing**: Voice recording and playback with Web Audio API
- **Speech Recognition**: Audio-to-text conversion (simulated for demo)
- **Text-to-Speech**: AI response audio generation (simulated for demo)
- **Conversation History**: Maintains context throughout the session
- **Error Handling**: Robust error handling and connection management

## Architecture

### Frontend (React.js)
- **VoiceChatInterface**: Main component handling UI and WebSocket communication
- **Audio Management**: MediaRecorder API for voice capture
- **Real-time Updates**: State management for chat messages and connection status
- **Responsive Design**: Mobile-first approach with CSS animations

### Backend (Node.js/Express)
- **WebSocket Server**: Handles real-time communication
- **Gemini Integration**: AI response generation with conversation context
- **Audio Processing**: Speech-to-text and text-to-speech simulation
- **Session Management**: Individual chat sessions with conversation history

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- Gemini API key from [Google AI Studio](https://aistudio.google.com)
- Modern web browser with microphone access

### Backend Setup

1. **Navigate to server directory**:
   \`\`\`bash
   cd server
   \`\`\`

2. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

3. **Configure environment variables**:
   \`\`\`bash
   cp .env.example .env
   # Edit .env and add your GEMINI_API_KEY
   \`\`\`

4. **Start the server**:
   \`\`\`bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   \`\`\`

   Server will run on `https://ai-voice-backend-production-ce85.up.railway.app/`

### Frontend Setup

1. **Install frontend dependencies** (if using separate setup):
   \`\`\`bash
   npm install
   \`\`\`

2. **Start the development server**:
   \`\`\`bash
   npm run dev
   \`\`\`

   Frontend will run on `http://localhost:3000`

### API Key Configuration

1. **Get Gemini API Key**:
   - Visit [Google AI Studio](https://aistudio.google.com)
   - Create a free account
   - Generate an API key

2. **Model Selection**:
   - **Production**: `gemini-2.5-flash-preview-native-audio-dialog` (native audio support)
   - **Development**: `gemini-2.0-flash-live-001` (higher rate limits for testing)

## Usage Instructions

### Getting Started

1. **Launch the application**:
   - Start both backend server and frontend
   - Open browser to `http://localhost:3000`

2. **Connect to AI**:
   - Click "Connect to AI" button
   - Allow microphone permissions when prompted

3. **Start Voice Chat**:
   - Press and hold the microphone button to record
   - Speak your message clearly
   - Release button to send audio to AI
   - AI will respond with both text and audio

### Key Features

- **Push-to-Talk**: Hold microphone button to record, release to send
- **Interruption**: Start speaking while AI is talking to interrupt
- **Visual Feedback**: Recording indicators and connection status
- **Chat History**: View conversation transcript in real-time
- **Responsive Design**: Works on desktop and mobile devices

## Technical Implementation

### WebSocket Communication
\`\`\`javascript
// Client sends audio data
{
  type: 'audio_input',
  audio: [/* Uint8Array audio data */]
}

// Server responds with transcript and audio
{
  type: 'transcript',
  speaker: 'user|ai',
  text: 'transcribed text'
}

{
  type: 'audio_response',
  audio: [/* Uint8Array audio response */]
}
\`\`\`

### Audio Processing
- **Recording**: MediaRecorder API with 16kHz sample rate
- **Playback**: HTML5 Audio API for AI responses
- **Format**: WebM/Opus for recording, WAV for playback

### AI Integration
- **Model**: Gemini 2.0 Flash Live for development
- **Context**: Maintains conversation history for coherent responses
- **Instructions**: Specialized for Revolt Motors domain knowledge

## Production Considerations

### For Production Deployment

1. **Real Audio Processing**:
   - Integrate Google Speech-to-Text API
   - Implement Google Text-to-Speech API
   - Handle various audio formats and quality

2. **Security**:
   - Implement authentication and authorization
   - Add rate limiting and request validation
   - Secure WebSocket connections with WSS

3. **Scalability**:
   - Use Redis for session management
   - Implement load balancing for multiple servers
   - Add monitoring and logging

4. **Performance**:
   - Optimize audio compression
   - Implement audio streaming for large responses
   - Add caching for common responses

## Troubleshooting

### Common Issues
Fixed the audio issue there is miner change

1. **Microphone Access Denied**:
   - Check browser permissions
   - Ensure HTTPS in production
   - Try different browser

2. **WebSocket Connection Failed**:
   - Verify server is running on port 3001
   - Check firewall settings
   - Ensure correct WebSocket URL

3. **API Rate Limits**:
   - Switch to development model for testing
   - Implement request queuing
   - Add retry logic with exponential backoff

### Debug Mode
Enable debug logging by checking browser console for `[v0]` prefixed messages.

## License

MIT License - Feel free to use and modify for your projects.
