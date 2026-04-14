import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  ArrowUp,
  Plus,
  X,
  ExternalLink,
  FileText,
  Shield,
  Layout,
  MessageSquare,
  BookOpen,
  Zap,
  Bot,
  Cpu,
  Building2,
  Layers,
  Database,
  ClipboardCheck,
  ChevronRight,
  Paperclip,
  Menu,
  Check,
} from 'lucide-react'
import {
  conversationSteps,
  governanceRecords,
  assessmentCards,
  type ChatMessage,
  type AssessmentCard,
} from '@/data/mockFlow'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  zap: Zap,
  bot: Bot,
  cpu: Cpu,
  building2: Building2,
  layers: Layers,
  database: Database,
  shield: Shield,
  'clipboard-check': ClipboardCheck,
}

const fileIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  pdf: FileText,
  image: Layout,
  doc: MessageSquare,
}

const riskColors = {
  low: { bg: 'bg-green-50', text: 'text-green-700' },
  medium: { bg: 'bg-amber-50', text: 'text-amber-700' },
  high: { bg: 'bg-red-50', text: 'text-red-700' },
  'very-high': { bg: 'bg-red-100', text: 'text-red-800' },
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  )
}

function AssessmentCardItem({
  card,
  onClick,
  delay,
  isHighlighted,
  isCompleted,
}: {
  card: AssessmentCard
  onClick: () => void
  delay: number
  isHighlighted?: boolean
  isCompleted?: boolean
}) {
  const risk = riskColors[card.riskLevel]
  const typeLabel = card.type === 'privacy' ? 'Privacy' : card.type === 'security' ? 'Security' : card.type === 'third-party' ? 'Third-Party Risk' : 'AI Risk'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ 
        opacity: isCompleted ? 0.7 : 1, 
        y: 0
      }}
      transition={{ delay, duration: 0.3, ease: 'easeOut' }}
      onClick={onClick}
      className={`bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-primary/40 hover:shadow-md transition-all duration-300 group ${
        isHighlighted ? 'highlight-stroke' : ''
      } ${isCompleted ? 'pointer-events-none' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            {typeLabel}
          </span>
          <p className="text-sm font-semibold text-gray-900 leading-snug mt-0.5">{card.title}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors mt-1 flex-shrink-0" />
      </div>

      <Progress value={isCompleted ? 100 : card.progress} className={`mt-3 mb-2 transition-all duration-500 ${isCompleted ? '[&>div]:bg-green-500' : ''}`} />

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1.5">
          {isCompleted ? (
            <Badge variant="default" className="text-xs bg-green-500 hover:bg-green-500">Complete</Badge>
          ) : (
            <Badge variant="inprogress" className="text-xs">Not Started</Badge>
          )}
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${risk.bg} ${risk.text}`}>
            {card.riskLevel === 'very-high' ? 'Very High' : card.riskLevel.charAt(0).toUpperCase() + card.riskLevel.slice(1)} Risk
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
            {card.ownerInitials}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span>{isCompleted ? 100 : card.progress}%</span>
            <span className="text-gray-300">|</span>
            <span className="text-primary font-medium">{card.questionsAnswered}/{card.totalQuestions} from docs</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function AgentCanvas() {
  const navigate = useNavigate()
  const location = useLocation()
  const initialPrompt = location.state?.initialPrompt ?? ''

  const [step, setStep] = useState(0)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showRecords, setShowRecords] = useState(false)
  const [visibleRecords, setVisibleRecords] = useState(0)
  const [showAssessments, setShowAssessments] = useState(false)
  const [projectTitle, setProjectTitle] = useState('')
  const [projectSummary, setProjectSummary] = useState('')
  const [chatTitle, setChatTitle] = useState('Customer Support AI Copilot')
  const [isEditingChatTitle, setIsEditingChatTitle] = useState(false)
  const chatTitleInputRef = useRef<HTMLInputElement>(null)
  const [progressLabel, setProgressLabel] = useState<string | null>(null)
  const [highlightedAssessments, setHighlightedAssessments] = useState<string[]>([])
  const [completedAssessments, setCompletedAssessments] = useState<string[]>([])
  const chatBottomRef = useRef<HTMLDivElement>(null)
  const recordsRef = useRef<HTMLDivElement>(null)
  const assessmentsRef = useRef<HTMLDivElement>(null)

  // Bootstrap with initial prompt
  useEffect(() => {
    if (initialPrompt) {
      setTimeout(() => advanceStep(initialPrompt), 400)
    }
  }, [])

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Scroll to governance records when they appear
  useEffect(() => {
    if (showRecords && recordsRef.current) {
      setTimeout(() => {
        recordsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }, 300)
    }
  }, [showRecords])

  // Scroll to assessments when they appear
  useEffect(() => {
    if (showAssessments && assessmentsRef.current) {
      setTimeout(() => {
        assessmentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }, 300)
    }
  }, [showAssessments])

  const advanceStep = (userInput?: string) => {
    const nextStep = step + 1
    if (nextStep >= conversationSteps.length) return

    const newMessages = [...conversationSteps[nextStep]]

    if (userInput && newMessages[0]?.role === 'user') {
      newMessages[0] = { ...newMessages[0], content: userInput }
    }

    // Show first user message immediately
    const firstUserMsg = newMessages.find(m => m.role === 'user')
    if (firstUserMsg) {
      setMessages(prev => {
        if (prev.some(m => m.id === firstUserMsg.id)) return prev
        return [...prev, firstUserMsg]
      })
    }

    // Get remaining messages (excluding the first user message we already added)
    const remainingMessages = newMessages.filter(m => m !== firstUserMsg)

    // Show typing then remaining messages (only if there are messages to show)
    if (remainingMessages.length === 0) {
      setStep(nextStep)
      return
    }

    // Check if any message has a progress label
    const progressMsg = remainingMessages.find(m => m.progress)
    if (progressMsg?.progress) {
      setProgressLabel(progressMsg.progress.label)
    }

    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      setProgressLabel(null)
      let delay = 0
      remainingMessages.forEach((msg, i) => {
        setTimeout(() => {
          setMessages(prev => {
            if (prev.some(m => m.id === msg.id)) return prev
            return [...prev, msg]
          })
          // Side effects per step
          if (nextStep === 1 && msg.role === 'assistant' && i === 0) {
            setProjectTitle('Customer Support Copilot for Zendesk')
            setProjectSummary(
              'This initiative deploys an AI-powered assistant to help support agents summarize tickets, draft customer replies, and search internal knowledge bases. Personal data including ticket content, customer identifiers, and account metadata will be processed by the system.'
            )
          }
          // Step 2: Show documents in canvas after upload
          if (nextStep === 2 && msg.role === 'assistant' && (msg as any).showDocuments) {
            // Documents will be shown in canvas
          }
          // Step 3: Show records after user confirms
          if (nextStep === 3 && msg.role === 'assistant' && (msg as any).showRecords) {
            setShowRecords(true)
            // Animate records one by one (limit to 4)
            for (let r = 0; r < 4; r++) {
              setTimeout(() => setVisibleRecords(r + 1), r * 200)
            }
          }
          // Step 4: Show assessments after creation
          if (nextStep === 4 && msg.role === 'assistant' && (msg as any).showAssessments) {
            setShowAssessments(true)
            // Highlight all assessments
            setHighlightedAssessments(['privacy', 'security', 'third-party', 'ai-risk'])
            setTimeout(() => {
              setHighlightedAssessments([])
            }, 2000)
          }
        }, delay)
        delay += 800
      })
      setStep(nextStep)
    }, 1200)
  }

  const handleSend = () => {
    if (!inputValue.trim()) return
    advanceStep(inputValue)
    setInputValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar title="Agent Canvas" />

        <div className="flex flex-1 overflow-hidden">
          {/* Left: Canvas */}
          <main className="flex-1 overflow-y-auto scrollbar-thin px-8 py-8">
            <AnimatePresence>
              {projectTitle && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8"
                >
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">{projectTitle}</h1>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Summary</p>
                  <p className="text-sm text-gray-700 leading-relaxed max-w-2xl">{projectSummary}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Documents row */}
            <AnimatePresence>
              {projectTitle && step >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-8"
                >
                  <p className="text-xs font-semibold text-gray-500 mb-2">Documents</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {step >= 4 && (
                      <>
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 font-medium">
                          <FileText className="w-3.5 h-3.5 text-red-500" />
                          OpenAI_DPA_2024.pdf
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 font-medium">
                          <FileText className="w-3.5 h-3.5 text-red-500" />
                          Vendor_Security_Overview.pdf
                        </div>
                        <button className="flex items-center justify-center w-8 h-8 bg-white border border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors text-sm">
                          +
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Governance records */}
            <AnimatePresence>
              {showRecords && (
                <motion.div
                  ref={recordsRef}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-sm font-semibold text-gray-900">Governance Records</h2>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-purple-50 text-purple-700 rounded-full border border-purple-100">
                      AI
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {governanceRecords.slice(0, Math.min(visibleRecords, 4)).map((record, i) => {
                      const Icon = iconMap[record.icon] || Database
                      return (
                        <motion.div
                          key={record.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.25, ease: 'easeOut' }}
                          className="flex items-start gap-2.5 p-3 bg-white border border-gray-200 rounded-lg"
                        >
                          <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Icon className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{record.label}</p>
                            <p className="text-xs text-gray-800 font-medium mt-0.5 truncate">{record.values.join(', ')}</p>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Assessment cards */}
            <AnimatePresence>
              {showAssessments && (
                <motion.div
                  ref={assessmentsRef}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-sm font-semibold text-gray-900">Recommended Assessments</h2>
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                      4 created
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {assessmentCards.map((card, i) => (
<AssessmentCardItem
  key={card.id}
  card={card}
  delay={i * 0.1}
  onClick={() => navigate('/prelaunch', { state: { assessment: card } })}
  isHighlighted={highlightedAssessments.includes(card.id)}
  isCompleted={completedAssessments.includes(card.id)}
  />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!projectTitle && (
              <div className="flex flex-col items-center justify-center h-full text-center pt-32">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <p className="text-gray-400 text-sm">Agent output will be seen here.</p>
              </div>
            )}
          </main>

          {/* Right: Chat drawer */}
          <motion.aside
            initial={{ x: 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="w-[380px] flex flex-col bg-white border-l border-gray-100 flex-shrink-0"
          >
            {/* Drawer header */}
            <div className="flex flex-col px-5 py-3.5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Menu className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-900">Copilot</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="text-xs h-7 px-3" onClick={() => {
                    setChatTitle('Customer Support AI Copilot')
                    setMessages([])
                    setStep(0)
                    setShowRecords(false)
                    setShowAssessments(false)
                    setProjectTitle('')
                    setProjectSummary('')
                  }}>
                    New chat
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate('/')}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              {/* Editable chat title */}
              <div className="mt-2 flex items-center justify-between">
                <div>
                  {isEditingChatTitle ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        ref={chatTitleInputRef}
                        type="text"
                        value={chatTitle}
                        onChange={(e) => setChatTitle(e.target.value)}
                        onBlur={() => setIsEditingChatTitle(false)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setIsEditingChatTitle(false)
                          }
                          if (e.key === 'Escape') {
                            setIsEditingChatTitle(false)
                          }
                        }}
                        className="flex-1 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        autoFocus
                      />
                      <button
                        onClick={() => setIsEditingChatTitle(false)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsEditingChatTitle(true)}
                      className="text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 px-1.5 py-0.5 -ml-1.5 rounded transition-colors"
                    >
                      {chatTitle}
                    </button>
                  )}
                </div>
                {/* Save indicator */}
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span>Saved to Mike&apos;s history</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 space-y-4">
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'user' ? (
                    <div className="max-w-[80%]">
                      <div className="bg-gray-100 rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm text-gray-800 leading-relaxed">
                        {msg.content}
                      </div>
                      {msg.files && msg.files.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2 justify-end">
                          {msg.files.map(f => {
                            const Icon = fileIconMap[f.type] || FileText
                            return (
                              <div
                                key={f.name}
                                className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 font-medium"
                              >
                                <Icon className="w-3 h-3 text-red-500" />
                                {f.name}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="max-w-[85%] flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-[9px] font-bold">AI</span>
                      </div>
                      <div>
                        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                          {msg.content.split('**').map((part, i) =>
                            i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                          )}
                        </div>
                        {msg.todoList && (
                          <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <div className="space-y-2">
                              {msg.todoList.map((todo: { id: string; label: string; status: string }, idx: number) => (
                                idx === 0 ? (
                                  <div key={todo.id} className="flex items-center gap-2.5">
                                    <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0">
                                      {idx + 1}
                                    </div>
                                    <button
                                      onClick={() => navigate('/prelaunch')}
                                      className="flex-1 text-left bg-primary text-white rounded-lg px-3 py-2 hover:bg-primary/90 transition-colors"
                                    >
                                      <span className="text-xs font-medium">{todo.label}</span>
                                    </button>
                                  </div>
                                ) : (
                                  <div key={todo.id} className="flex items-center gap-2.5">
                                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center text-[10px] font-bold text-gray-400">
                                      {idx + 1}
                                    </div>
                                    <span className="text-xs text-gray-700">{todo.label}</span>
                                  </div>
                                )
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}

              {isTyping && (
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[9px] font-bold">AI</span>
                  </div>
                  {progressLabel ? (
                    <div className="flex items-center gap-1.5 pt-1">
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-400 border-t-transparent animate-spin" />
                      <span className="text-sm text-gray-500">{progressLabel}</span>
                    </div>
                  ) : (
                    <TypingIndicator />
                  )}
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Confirm buttons for AI actions */}
            {step === 4 && showRecords && (
              <div className="px-5 py-2 border-t border-gray-100 space-y-1.5">
                {['Add 2 third-parties: OpenAI, Glean', 'Add 1 Third-Party assessment: OpenAI'].map(action => (
                  <div key={action} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs">
                    <span className="text-gray-700 font-medium">{action}</span>
                    <div className="flex gap-1">
                      <button className="p-1 text-gray-400 hover:text-red-500 transition-colors"><X className="w-3.5 h-3.5" /></button>
                      <button className="p-1 text-gray-400 hover:text-primary transition-colors"><Check className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Input area */}
            <div className="px-5 py-4 border-t border-gray-100">
              {step < conversationSteps.length - 1 && (
                <p className="text-xs text-gray-400 text-center mb-2">
                  Context: <span className="font-medium text-gray-600">Customer Support Copilot for Zendesk</span>
                </p>
              )}
              <div className="relative bg-gray-50 border border-gray-200 rounded-xl focus-within:border-primary focus-within:bg-white transition-all duration-150">
                <textarea
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Copilot"
                  aria-label="Chat input"
                  rows={2}
                  className="w-full resize-none bg-transparent px-4 pt-3 pb-1 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none leading-relaxed"
                />
                <div className="flex items-center justify-between px-3 pb-2">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400" aria-label="Attach">
                    <Paperclip className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    onClick={handleSend}
                    disabled={!inputValue.trim() && step >= conversationSteps.length - 1}
                    size="icon"
                    className="h-7 w-7 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-30"
                    aria-label="Send"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <p className="text-[11px] text-gray-400 mt-2 text-center">
                AI can make mistakes. Verify info.{' '}
                <button className="text-primary hover:underline">Learn more</button>
              </p>
            </div>
          </motion.aside>
        </div>
      </div>
    </div>
  )
}
