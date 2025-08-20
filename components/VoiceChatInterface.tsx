"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import "../styles/VoiceChat.css"

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
}

interface VoiceChatState {
  isConnected: boolean
  isRecording: boolean
  isAITalking: boolean
  messages: Message[]
  connectionStatus: "disconnected" | "connecting" | "connected" | "error"
}

export default function VoiceChatInterface() {
  const [state, setState] = useState<VoiceChatState>({
    isConnected: false,
    isRecording: false,
    isAITalking: false,
    messages: [],
    connectionStatus: "disconnected",
  })

  const wsRef = useRef<WebSocket | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const currentAudioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize WebSocket connection
  const connectWebSocket = useCallback(() => {
    setState((prev) => ({ ...prev, connectionStatus: "connecting" }))

    try {
      // wsRef.current = new WebSocket("ws://localhost:3001")
    wsRef.current = new WebSocket("wss://ai-voice-backend-production-ce85.up.railway.app/");


      wsRef.current.onopen = () => {
        setState((prev) => ({
          ...prev,
          isConnected: true,
          connectionStatus: "connected",
        }))
        console.log("[v0] WebSocket connected successfully")
      }

      wsRef.current.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log("[v0] Received message:", data.type)

          if (data.type === "audio_response") {
            // Stop current AI audio if playing
            if (currentAudioRef.current) {
              currentAudioRef.current.pause()
              currentAudioRef.current = null
            }

            // Play AI response audio
            const audioBlob = new Blob([new Uint8Array(data.audio)], { type: "audio/wav" })
            const audioUrl = URL.createObjectURL(audioBlob)
            const audio = new Audio(audioUrl)
            currentAudioRef.current = audio

            setState((prev) => ({ ...prev, isAITalking: true }))

            audio.onended = () => {
              setState((prev) => ({ ...prev, isAITalking: false }))
              URL.revokeObjectURL(audioUrl)
              currentAudioRef.current = null
            }

            await audio.play()
          } 
          else if (data.type === "transcript") {
            // Add message to chat
            const newMessage: Message = {
              id: Date.now().toString(),
              type: data.speaker === "user" ? "user" : "ai",
              content: data.text,
              timestamp: new Date(),
            }

            setState((prev) => ({
              ...prev,
              messages: [...prev.messages, newMessage],
            }))
          }
        } catch (error) {
          console.error("[v0] Error processing WebSocket message:", error)
        }
      }

      wsRef.current.onerror = (error) => {
        console.error("[v0] WebSocket error:", error)
        setState((prev) => ({
          ...prev,
          connectionStatus: "error",
          isConnected: false,
        }))
      }

      wsRef.current.onclose = () => {
        setState((prev) => ({
          ...prev,
          isConnected: false,
          connectionStatus: "disconnected",
        }))
        console.log("[v0] WebSocket disconnected")
      }
    } catch (error) {
      console.error("[v0] Error creating WebSocket:", error)
      setState((prev) => ({ ...prev, connectionStatus: "error" }))
    }
  }, [])


  // Initialize WebSocket connection
// const connectWebSocket = useCallback(() => {
//   setState((prev) => ({ ...prev, connectionStatus: "connecting" }))

//   try {
//     // Pick URL based on where app is running
//     const backendUrl =
//       window.location.hostname === "localhost"
//         ? "ws://localhost:3001"
//         : "wss://ai-voice-backend-production-ce85.up.railway.app"

//     wsRef.current = new WebSocket(backendUrl)

//     wsRef.current.onopen = () => {
//       setState((prev) => ({
//         ...prev,
//         isConnected: true,
//         connectionStatus: "connected",
//       }))
//       console.log("[v0] WebSocket connected successfully:", backendUrl)
//     }

//     wsRef.current.onmessage = async (event) => {
//       try {
//         const data = JSON.parse(event.data)
//         console.log("[v0] Received message:", data.type)

//         if (data.type === "audio_response") {
//           if (currentAudioRef.current) {
//             currentAudioRef.current.pause()
//             currentAudioRef.current = null
//           }

//           const audioBlob = new Blob([new Uint8Array(data.audio)], { type: "audio/wav" })
//           const audioUrl = URL.createObjectURL(audioBlob)
//           const audio = new Audio(audioUrl)
//           currentAudioRef.current = audio

//           setState((prev) => ({ ...prev, isAITalking: true }))

//           audio.onended = () => {
//             setState((prev) => ({ ...prev, isAITalking: false }))
//             URL.revokeObjectURL(audioUrl)
//             currentAudioRef.current = null
//           }

//           await audio.play()
//         } else if (data.type === "transcript") {
//           const newMessage: Message = {
//             id: Date.now().toString(),
//             type: data.speaker === "user" ? "user" : "ai",
//             content: data.text,
//             timestamp: new Date(),
//           }

//           setState((prev) => ({
//             ...prev,
//             messages: [...prev.messages, newMessage],
//           }))
//         }
//       } catch (error) {
//         console.error("[v0] Error processing WebSocket message:", error)
//       }
//     }

//     wsRef.current.onerror = (error) => {
//       console.error("[v0] WebSocket error:", error)
//       setState((prev) => ({
//         ...prev,
//         connectionStatus: "error",
//         isConnected: false,
//       }))
//     }

//     wsRef.current.onclose = () => {
//       setState((prev) => ({
//         ...prev,
//         isConnected: false,
//         connectionStatus: "disconnected",
//       }))
//       console.log("[v0] WebSocket disconnected")
//     }
//   } catch (error) {
//     console.error("[v0] Error creating WebSocket:", error)
//     setState((prev) => ({ ...prev, connectionStatus: "error" }))
//   }
// }, [])



  // Initialize audio recording
  const initializeAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      })

      audioContextRef.current = new AudioContext({ sampleRate: 16000 })

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      })

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        audioChunksRef.current = []

        // Send audio to server
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          const reader = new FileReader()
          reader.onload = () => {
            wsRef.current?.send(
              JSON.stringify({
                type: "audio_input",
                audio: Array.from(new Uint8Array(reader.result as ArrayBuffer)),
              }),
            )
          }
          reader.readAsArrayBuffer(audioBlob)
        }
      }

      console.log("[v0] Audio initialized successfully")
    } catch (error) {
      console.error("[v0] Error initializing audio:", error)
    }
  }, [])

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      // Ask for mic permission + stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Setup MediaRecorder with a safe mimeType
      const options = { mimeType: "audio/webm;codecs=opus" }
      mediaRecorderRef.current = new MediaRecorder(stream, options)

      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data)
          console.log("[v0] Chunk received:", event.data.type, event.data.size)
        }
      }

      mediaRecorderRef.current.onstart = () => {
        console.log("[v0] Recording started ✅")
        setState((prev) => ({ ...prev, isRecording: true }))
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        audioChunksRef.current = []

        // Send audio to server
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          const reader = new FileReader()
          reader.onload = () => {
            wsRef.current?.send(
              JSON.stringify({
                type: "audio_input",
                audio: Array.from(new Uint8Array(reader.result as ArrayBuffer)),
              }),
            )
          }
          reader.readAsArrayBuffer(audioBlob)
        }
        
        setState((prev) => ({ ...prev, isRecording: false }))
        console.log("[v0] Recording stopped and audio sent")
      }

      mediaRecorderRef.current.onerror = (err) => {
        console.error("[v0] MediaRecorder error:", err)
      }

      // Start recording (collecting chunks every 100ms)
      mediaRecorderRef.current.start(100)

    } catch (err) {
      console.error("[v0] Could not start recording:", err)
    }
  }, [])

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
      console.log("[v0] Recording stopped")
    }
  }, [])

  // Handle push-to-talk
  const handleMouseDown = useCallback(() => {
    if (state.isConnected) {
      startRecording()
    }
  }, [state.isConnected, startRecording])

  const handleMouseUp = useCallback(() => {
    if (state.isRecording) {
      stopRecording()
    }
  }, [state.isRecording, stopRecording])

  // Initialize on component mount
  useEffect(() => {
    initializeAudio()
    return () => {
      // Cleanup
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (currentAudioRef.current) {
        currentAudioRef.current.pause()
      }
    }
  }, [initializeAudio])

  const getStatusColor = () => {
    switch (state.connectionStatus) {
      case "connected":
        return "#10b981"
      case "connecting":
        return "#f59e0b"
      case "error":
        return "#ef4444"
      default:
        return "#6b7280"
    }
  }

  const getStatusText = () => {
    switch (state.connectionStatus) {
      case "connected":
        return "Connected"
      case "connecting":
        return "Connecting..."
      case "error":
        return "Connection Error"
      default:
        return "Disconnected"
    }
  }

  return (
    <div className="voice-chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="header-content">
          <h1 className="app-title">Voice Chat AI</h1>
          <div className="connection-status">
            <div className="status-indicator" style={{ backgroundColor: getStatusColor() }}></div>
            <span className="status-text">{getStatusText()}</span>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="chat-messages">
        {state.messages.length === 0 ? (
          <div className="welcome-message">
            <div className="welcome-content">
              <h2>Welcome to Voice Chat AI</h2>
              <p>Press and hold the microphone button to start talking</p>
              <p>You can interrupt the AI at any time by speaking</p>
            </div>
          </div>
        ) : (
          state.messages.map((message) => (
            <div key={message.id} className={`message ${message.type}`}>
              <div className="message-content">
                <div className="message-header">
                  <span className="message-sender">{message.type === "user" ? "You" : "AI Assistant"}</span>
                  <span className="message-time">{message.timestamp.toLocaleTimeString()}</span>
                </div>
                <div className="message-text">{message.content}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Voice Controls */}
      <div className="voice-controls">
        <div className="controls-content">
          {!state.isConnected ? (
            <button
              className="connect-button"
              onClick={connectWebSocket}
              disabled={state.connectionStatus === "connecting"}
            >
              {state.connectionStatus === "connecting" ? "Connecting..." : "Connect to AI"}
            </button>
          ) : (
            <div className="voice-interface">
              <div className="recording-status">
                {state.isRecording && (
                  <div className="recording-indicator">
                    <div className="pulse-dot"></div>
                    <span>Recording...</span>
                  </div>
                )}
                {state.isAITalking && (
                  <div className="ai-talking-indicator">
                    <div className="ai-wave"></div>
                    <span>AI is speaking...</span>
                  </div>
                )}
              </div>

              <button
                className={`voice-button ${state.isRecording ? "recording" : ""}`}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                disabled={!state.isConnected}
              >
                <div className="mic-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                  </svg>
                </div>
                <span className="button-text">{state.isRecording ? "Release to Send" : "Hold to Talk"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}