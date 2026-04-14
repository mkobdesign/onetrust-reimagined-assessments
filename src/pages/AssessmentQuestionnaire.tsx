import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  CheckCircle2,
  Circle,
  Sparkles,
  Paperclip,
  ArrowUp,
  Search,
  MessageCircle,
  X,
  ChevronRight,
  ChevronDown,
  Bot,
  CheckCheck,
  Minus,
  FileText,
  AlertTriangle,
  Database,
  GripVertical,
  Trash2,
  Bookmark,
  Clock,
} from 'lucide-react'
import { privacyAssessmentSections, type Question } from '@/data/assessmentQuestions'
import { dataSources } from '@/data/mockFlow'

const aiMessages = [
  {
    id: 'ai1',
    content:
      "Good progress, 6 of 10 questions are complete. It's 62% ready for privacy approval thanks to the documents and assessments you selected.",
    delay: 0,
  },
  {
    id: 'ai2',
    content:
      'You can use these tools to generate answers, or have me guide you through the experience.',
    delay: 0,
  },
]



const readinessSummary = {
  records: 8,
  assessments: 4,
  complete: 72,
  followUps: 2,
  recommendation: 'Low risk with human-in-the-loop controls',
}

function QuestionNav({
  sections,
  currentQuestionId,
  onSelect,
}: {
  sections: typeof privacyAssessmentSections
  currentQuestionId: string
  onSelect: (id: string) => void
}) {
  return (
    <nav className="overflow-y-auto scrollbar-thin py-4" aria-label="Question navigation">
      {sections.map(section => (
        <div key={section.id} className="mb-4">
          <div className="px-4 py-1.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {section.title} ({section.count})
            </p>
          </div>
          {section.questions.map(q => {
            const isCurrent = q.id === currentQuestionId
            const isAnswered = q.answered
            const isMarkedForReview = q.markedForReview

            return (
              <button
                key={q.id}
                onClick={() => onSelect(q.id)}
                className={`w-full flex items-center gap-2.5 px-4 py-2 text-left transition-all duration-150 ${
                  isCurrent ? 'bg-primary/5 border-l-2 border-primary' : 'hover:bg-gray-50 border-l-2 border-transparent'
                }`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <div className="flex-shrink-0">
                  {isAnswered ? (
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  ) : isMarkedForReview ? (
                    <MessageCircle className="w-4 h-4 fill-[#6673C7] text-[#6673C7]" />
                  ) : isCurrent ? (
                    <div className="w-4 h-4 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    </div>
                  ) : (
                    <Circle className="w-4 h-4 text-gray-300" />
                  )}
                </div>
                <div className="min-w-0">
                  <span className="text-xs text-gray-400 font-mono">{q.number}</span>
                  <p className={`text-xs leading-snug truncate mt-0.5 ${isCurrent ? 'font-semibold text-gray-900' : isAnswered || isMarkedForReview ? 'text-gray-500' : 'text-gray-700'}`}>
                    {q.title}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      ))}
    </nav>
  )
}

function QuestionCard({
  question,
  onAnswer,
  onClarify,
  isActive,
  onAcceptSuggestion,
}: {
  question: Question
  onAnswer: (questionId: string, answerId: string) => void
  onClarify: (question: Question) => void
  isActive: boolean
  onAcceptSuggestion?: () => void
}) {
  const [selected, setSelected] = useState(question.aiPrefilled ?? '')
  const [suggestionAccepted, setSuggestionAccepted] = useState(false)
  const [suggestionDismissed, setSuggestionDismissed] = useState(false)

  const handleSelect = (value: string) => {
    setSelected(value)
    onAnswer(question.id, value)
  }

  const handleAcceptSuggestion = () => {
    if (question.suggestedAnswer) {
      setSelected(question.suggestedAnswer)
      onAnswer(question.id, question.suggestedAnswer)
      setSuggestionAccepted(true)
      onAcceptSuggestion?.()
    }
  }

  const suggestedOption = question.suggestedAnswer 
    ? question.options.find(opt => opt.id === question.suggestedAnswer)
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`bg-white border rounded-xl p-6 mb-4 transition-all duration-200 ${
        isActive ? 'border-primary/30 shadow-sm shadow-primary/5 border-l-2 border-l-primary' : 'border-gray-200'
      }`}
      id={`question-${question.id}`}
    >
      {/* Question header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
              {question.number}
            </span>
            {question.markedForReview && !suggestionAccepted && (
              <span className="inline-flex items-center gap-1 text-xs text-[#6673C7] bg-[#6673C7]/10 px-2 py-0.5 rounded-full font-medium">
                <MessageCircle className="w-3 h-3 fill-[#6673C7]" />
                Marked for review
              </span>
            )}
            {(question.answered || suggestionAccepted) && (
              <span className="inline-flex items-center gap-1 text-xs text-primary bg-primary/8 px-2 py-0.5 rounded-full font-medium">
                <Sparkles className="w-3 h-3" />
                AI pre-filled
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors">
            <Minus className="w-3 h-3" />
            Not applicable
          </button>
          <button
            onClick={() => onClarify(question)}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/30 bg-primary/5 hover:bg-primary/10 px-2.5 py-1 rounded-md transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            Ask Copilot
          </button>
        </div>
      </div>

      <h3 className="text-base font-semibold text-gray-900 mb-2 leading-snug">
        {question.title}
      </h3>
      <p className="text-sm text-gray-600 mb-5 leading-relaxed whitespace-pre-line">
        {question.description}
      </p>

      {/* Options */}
      <RadioGroup value={selected} onValueChange={handleSelect} className="space-y-1">
        {question.options.map(option => (
          <label
            key={option.id}
            className={`flex items-start gap-3 p-3.5 rounded-lg cursor-pointer transition-all duration-150 ${
              selected === option.id
                ? 'bg-primary/5'
                : 'hover:bg-gray-50'
            }`}
          >
            <RadioGroupItem value={option.id} id={`${question.id}-${option.id}`} className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-900">{option.label}</p>
              {option.description && (
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed whitespace-pre-line">
                  {option.description}
                </p>
              )}
            </div>
          </label>
        ))}
      </RadioGroup>

      {/* Suggested response box */}
      {question.markedForReview && suggestedOption && !suggestionAccepted && !suggestionDismissed && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 bg-[#6673C7]/5 border border-[#6673C7]/20 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#6673C7] flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-[#6673C7] mb-1">Suggested response</p>
              <p className="text-sm font-medium text-gray-900 mb-1">{suggestedOption.label}</p>
              {suggestedOption.description && (
                <p className="text-xs text-gray-600 leading-relaxed">{suggestedOption.description}</p>
              )}
              <div className="flex items-center gap-2 mt-3">
                <Button
                  size="sm"
                  className="h-7 text-xs bg-[#6673C7] hover:bg-[#6673C7]/90"
                  onClick={handleAcceptSuggestion}
                >
                  Accept
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-gray-500 hover:text-gray-700"
                  onClick={() => setSuggestionDismissed(true)}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Additional notes / rewrite area */}
      <div className="mt-5 pt-4 border-t border-gray-100">
        <label className="text-xs font-medium text-gray-700 mb-2 block">
          Additional notes
        </label>
        <div className="relative">
          <textarea
            placeholder="Add context or clarifications for this answer..."
            className="w-full resize-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary focus:bg-white transition-all duration-150 min-h-[80px]"
            rows={3}
          />
          <div className="flex items-center justify-between mt-2">
            <Button variant="outline" size="sm" className="text-xs h-8">
              <Paperclip className="w-3.5 h-3.5 mr-1.5" />
              Add attachment
            </Button>
            <button
              className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-primary px-2.5 py-1.5 rounded-md hover:bg-primary/5 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" strokeLinejoin="round" fill="currentColor">
                <path d="M15.11 4.44L5.08 14.47C4.42 15.13 3.53 15.5 2.59 15.5H0.235V13.14C0.235 12.2 0.607 11.31 1.268 10.65L11.29 0.62L15.11 4.44ZM12 10.09C12.38 10.09 12.69 10.4 12.69 10.78C12.69 10.91 12.76 11.09 12.91 11.24C13.06 11.39 13.24 11.46 13.37 11.46C13.75 11.46 14.06 11.77 14.06 12.15C14.06 12.53 13.75 12.84 13.37 12.84C13.24 12.84 13.06 12.91 12.91 13.06C12.76 13.21 12.69 13.39 12.69 13.52C12.69 13.9 12.38 14.21 12 14.21C11.62 14.21 11.31 13.9 11.31 13.52C11.31 13.39 11.24 13.21 11.09 13.06C10.94 12.91 10.76 12.84 10.63 12.84C10.25 12.84 9.94 12.53 9.94 12.15C9.94 11.77 10.25 11.46 10.63 11.46C10.76 11.46 10.94 11.39 11.09 11.24C11.24 11.09 11.31 10.91 11.31 10.78C11.31 10.4 11.62 10.09 12 10.09ZM2.26 11.63C1.87 12.02 1.65 12.58 1.65 13.17V14.09H2.59C3.18 14.09 3.74 13.87 4.13 13.48L10.29 7.32L8.47 5.5L2.26 11.63ZM3.29 0.68C3.68 0.68 4 0.99 4 1.39C4 1.7 4.15 2.06 4.43 2.34C4.71 2.62 5.07 2.77 5.38 2.77C5.78 2.77 6.09 3.08 6.09 3.48C6.09 3.88 5.78 4.19 5.38 4.19C5.07 4.19 4.71 4.34 4.43 4.62C4.15 4.9 4 5.26 4 5.57C4 5.97 3.68 6.28 3.29 6.28C2.9 6.28 2.59 5.97 2.59 5.57C2.59 5.26 2.44 4.9 2.16 4.62C1.88 4.34 1.52 4.19 1.21 4.19C0.79 4.19 0.47 3.88 0.47 3.48C0.47 3.08 0.79 2.77 1.21 2.77C1.52 2.77 1.88 2.62 2.16 2.34C2.44 2.06 2.59 1.7 2.59 1.39C2.59 0.99 2.9 0.68 3.29 0.68ZM9.47 4.44L11.29 6.26L12.76 4.79L11.29 2.61L9.47 4.44ZM3.14 3.34C3.09 3.39 3.04 3.44 2.98 3.49C3.04 3.54 3.09 3.59 3.14 3.64C3.19 3.69 3.24 3.74 3.29 3.8C3.34 3.74 3.39 3.69 3.44 3.64C3.49 3.59 3.54 3.54 3.6 3.49C3.54 3.44 3.49 3.39 3.44 3.34C3.39 3.29 3.34 3.24 3.29 3.18C3.24 3.24 3.19 3.29 3.14 3.34Z" />
              </svg>
              Rewrite with Copilot
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Data Sources Card component with collapsible stats per item
function DataSourcesCard() {
  const [isEditMode, setIsEditMode] = useState(false)
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({})
  const [localSources, setLocalSources] = useState(dataSources)

  const toggleSourceExpanded = (id: string) => {
    setExpandedSources(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleDeleteSource = (id: string) => {
    setLocalSources(prev => prev.filter(s => s.id !== id))
  }

  const handleCancel = () => {
    setLocalSources(dataSources)
    setIsEditMode(false)
  }

  // Per-source stats (mock data varying by source)
  const getSourceStats = (sourceId: string) => {
    const statsMap: Record<string, { relevance: string; completeness: string; freshness: string; contradictions: string }> = {
      dpa: { relevance: 'High', completeness: 'Complete', freshness: 'Current', contradictions: 'None' },
      security: { relevance: 'High', completeness: 'Good', freshness: 'Current', contradictions: 'None' },
      architecture: { relevance: 'Medium', completeness: 'Partial', freshness: '6 months old', contradictions: 'None' },
      prompts: { relevance: 'High', completeness: 'Complete', freshness: 'Current', contradictions: 'None' },
      sop: { relevance: 'High', completeness: 'Good', freshness: 'Current', contradictions: 'None' },
    }
    return statsMap[sourceId] || { relevance: 'Unknown', completeness: 'Unknown', freshness: 'Unknown', contradictions: 'Unknown' }
  }

  const getSourceQuestions = (sourceId: string) => {
    const questionsMap: Record<string, string[]> = {
      dpa: ['Where will data be stored geographically?', 'What transfer mechanisms are in place?', 'What is the data retention period?'],
      security: ['Which systems process data?', 'What security controls are in place?'],
      architecture: ['Where are data subjects located?', 'What is the data flow architecture?'],
      prompts: ['What types of prompts are used?', 'Is personal data included in prompts?'],
      sop: ['Is human review required?', 'What is the escalation workflow?'],
    }
    return questionsMap[sourceId] || []
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-gray-100 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-900">Data Sources</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Documents used to generate answers</p>
        </div>
        {!isEditMode ? (
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-[10px] px-2"
            onClick={() => setIsEditMode(true)}
          >
            Edit
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-[10px] px-2"
            onClick={handleCancel}
          >
            Cancel
          </Button>
        )}
      </div>
      
      {/* Document list with per-item health */}
      <div className="divide-y divide-gray-100">
        {localSources.map((source, i) => {
          const stats = getSourceStats(source.id)
          const questions = getSourceQuestions(source.id)
          const isExpanded = expandedSources[source.id]
          const hasWarning = stats.completeness === 'Partial' || stats.freshness.includes('months')

          return (
            <div key={source.id}>
              {/* Source row */}
              <div className={`px-3 py-2.5 ${isEditMode ? 'bg-gray-50' : ''}`}>
                <div className="flex items-center gap-2">
                  {isEditMode && (
                    <GripVertical className="w-3 h-3 text-gray-400 cursor-grab flex-shrink-0" />
                  )}
                  <span className="text-gray-400 text-xs w-4">{i + 1}.</span>
                  <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{source.name}</p>
                    <p className="text-[10px] text-gray-500">{source.type}</p>
                  </div>
                  {hasWarning && !isEditMode && (
                    <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0" />
                  )}
                  {isEditMode ? (
                    <button
                      onClick={() => handleDeleteSource(source.id)}
                      className="p-1 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleSourceExpanded(source.id)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded health info */}
              <AnimatePresence>
                {isExpanded && !isEditMode && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 pt-1 bg-gray-50/50 space-y-2">
                      {/* Stats row */}
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="text-[10px]">
                          <span className="text-gray-500">Relevance:</span>{' '}
                          <span className={stats.relevance === 'High' ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>{stats.relevance}</span>
                        </div>
                        <div className="text-[10px]">
                          <span className="text-gray-500">Completeness:</span>{' '}
                          <span className={stats.completeness === 'Complete' || stats.completeness === 'Good' ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>{stats.completeness}</span>
                        </div>
                        <div className="text-[10px]">
                          <span className="text-gray-500">Freshness:</span>{' '}
                          <span className={stats.freshness === 'Current' ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>{stats.freshness}</span>
                        </div>
                        <div className="text-[10px]">
                          <span className="text-gray-500">Contradictions:</span>{' '}
                          <span className="text-green-600 font-medium">{stats.contradictions}</span>
                        </div>
                      </div>

                      {/* Questions answered */}
                      {questions.length > 0 && (
                        <div className="pt-1.5 border-t border-gray-200">
                          <p className="text-[10px] text-gray-500 mb-1">Questions answered:</p>
                          <div className="space-y-0.5">
                            {questions.map((q, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 text-[10px]">
                                <CheckCircle2 className="w-2.5 h-2.5 text-green-500 flex-shrink-0" />
                                <span className="text-gray-700 truncate">{q}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* Edit mode footer */}
      {isEditMode && (
        <div className="px-3 py-3 border-t border-gray-200 bg-amber-50/50 space-y-2">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-700">Changes may take up to 10 minutes to process and regenerate answers.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="h-7 text-xs flex-1"
              onClick={() => setIsEditMode(false)}
            >
              Confirm
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AssessmentQuestionnaire() {
  const navigate = useNavigate()
  const [currentQuestionId, setCurrentQuestionId] = useState('q1-1')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [activeGuide, setActiveGuide] = useState<Question | null>(null)
  const [chatInput, setChatInput] = useState('')
  const [guideConversation, setGuideConversation] = useState<Array<{ role: 'user' | 'assistant'; content: string; options?: Array<{ id: string; label: string }> }>>([])
  const [isGuideTyping, setIsGuideTyping] = useState(false)
  const [acceptedSuggestions, setAcceptedSuggestions] = useState<number>(0)
  
  // Guide history - stores conversations per question with timestamps
  type GuideSession = {
    timestamp: Date
    conversation: Array<{ role: 'user' | 'assistant'; content: string }>
  }
  const [guideHistory, setGuideHistory] = useState<Record<string, GuideSession[]>>({})
  
  // Track if all residency suggestions accepted (3) and all systems questions answered (3)
  const systemsQuestionIds = ['q2-1', 'q2-3', 'q2-4']
  const systemsAnsweredCount = systemsQuestionIds.filter(id => answers[id]).length
  const showGovernanceReadiness = acceptedSuggestions >= 3 && systemsAnsweredCount >= 3
  const chatBottomRef = useRef<HTMLDivElement>(null)
  const mainContentRef = useRef<HTMLElement>(null)

  // Scroll-based active question tracking
  useEffect(() => {
    const mainContent = mainContentRef.current
    if (!mainContent) return

    const allQuestionIds = privacyAssessmentSections.flatMap(s => s.questions.map(q => q.id))
    
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter(entry => entry.isIntersecting)
        if (visibleEntries.length > 0) {
          // Find the topmost visible question
          const topEntry = visibleEntries.reduce((prev, curr) => 
            prev.boundingClientRect.top < curr.boundingClientRect.top ? prev : curr
          )
          const questionId = topEntry.target.id.replace('question-', '')
          if (allQuestionIds.includes(questionId)) {
            setCurrentQuestionId(questionId)
          }
        }
      },
      {
        root: mainContent,
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
      }
    )

    // Observe all question elements
    allQuestionIds.forEach(id => {
      const element = document.getElementById(`question-${id}`)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [])

  const allQuestions = privacyAssessmentSections.flatMap(s => s.questions)
  const unansweredQuestions = allQuestions.filter(q => !q.answered && !answers[q.id]).slice(0, 3)
  const displayQuestions = [...allQuestions.filter(q => q.answered), ...unansweredQuestions]
    .filter((q, i, arr) => arr.indexOf(q) === i)
    .slice(-3)

  const answeredCount = allQuestions.filter(q => q.answered || answers[q.id]).length
  const totalCount = allQuestions.length + 4 // simulate more questions
  const progress = Math.round((answeredCount / totalCount) * 100) + 40



  const handleAnswer = (questionId: string, answerId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerId }))
  }

  const handleClarify = (question: Question) => {
    setActiveGuide(question)
    setCurrentQuestionId(question.id)
    // Initialize guide conversation with AI intro message
    setGuideConversation([
      {
        role: 'assistant',
        content: `Let me help you understand "${question.title}". ${question.clarifyExplanation || 'This question helps us assess compliance requirements for your project.'}`,
      },
      {
        role: 'assistant',
        content: 'Here are the available options for this question:',
        options: question.options.map(opt => ({ id: opt.id, label: opt.label })),
      },
    ])
  }

  const handleGuideChatSend = () => {
    if (!chatInput.trim() || !activeGuide) return
    const userMessage = chatInput.trim()
    setGuideConversation(prev => [...prev, { role: 'user', content: userMessage }])
    setChatInput('')
    setIsGuideTyping(true)

    // Simulate AI response
    setTimeout(() => {
      setIsGuideTyping(false)
      const responses = [
        `Based on your question about "${userMessage.slice(0, 30)}...", I'd recommend considering the compliance implications. The best approach depends on how personal data is being processed.`,
        `Great question! For this assessment, you'll want to document the specific data flows involved. Would you like me to suggest an answer based on the context you've provided?`,
        `I understand your concern. Looking at similar assessments, the most common approach is to select the option that best reflects your current data handling practices. Would you like me to pre-fill a suggested answer?`,
      ]
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      setGuideConversation(prev => [...prev, { role: 'assistant', content: randomResponse }])
    }, 1200)
  }

  const handleChatSend = () => {
    if (!chatInput.trim()) return
    setChatInput('')
  }

  const handleAcceptSuggestion = () => {
    setAcceptedSuggestions(prev => prev + 1)
  }

  const handleQuestionSelect = (questionId: string) => {
    setCurrentQuestionId(questionId)
    const element = document.getElementById(`question-${questionId}`)
    const container = mainContentRef.current
    if (element && container) {
      const elementTop = element.offsetTop
      // Offset by 80px to account for section header height
      container.scrollTo({ top: Math.max(0, elementTop - 80), behavior: 'smooth' })
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar
          title="Privacy Review Request for Magellan Mobile App"
          actions={
            <Button size="sm" className="mr-2 text-xs" onClick={() => navigate('/success')}>
              Submit for review
            </Button>
          }
        />

        <div className="flex flex-1 overflow-hidden">
          {/* Left: Question nav */}
          <aside className="w-[220px] bg-white border-r border-gray-100 flex-shrink-0 overflow-hidden flex flex-col">
            {/* Status row */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs font-semibold text-gray-700">In progress</span>
              </div>
              <Progress value={progress} className="mb-1" />
              <p className="text-xs text-gray-500">{progress}% complete</p>
            </div>

            {/* Participants */}
            <div className="px-4 py-2.5 border-b border-gray-100">
              <p className="text-xs text-gray-400 mb-2">Participants</p>
              <div className="flex items-center gap-1">
                {['RS', 'MR', 'KP'].map(initials => (
                  <div
                    key={initials}
                    className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[9px] font-bold flex items-center justify-center border-2 border-white -ml-1 first:ml-0"
                  >
                    {initials}
                  </div>
                ))}
                <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-[9px] font-bold flex items-center justify-center border-2 border-white -ml-1">
                  +2
                </div>
              </div>
            </div>

                <QuestionNav
                  sections={privacyAssessmentSections}
                  currentQuestionId={currentQuestionId}
                  onSelect={handleQuestionSelect}
                />
          </aside>

          {/* Main: Questions */}
          <main ref={mainContentRef} className="flex-1 overflow-y-auto scrollbar-thin px-8 py-6">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <h2 className="text-base font-semibold text-gray-900">Residency information</h2>
                <span className="text-xs text-gray-400">— 3 questions</span>
                <span className="ml-2 inline-flex items-center gap-1 text-xs text-[#6673C7] bg-[#6673C7]/10 px-2 py-0.5 rounded-full font-medium">
                  <MessageCircle className="w-3 h-3 fill-[#6673C7]" />
                  3 marked for review
                </span>
              </div>

              {/* Show the 3 residency questions */}
              {privacyAssessmentSections[0].questions.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  onAnswer={handleAnswer}
                  onClarify={handleClarify}
                  isActive={question.id === currentQuestionId}
                  onAcceptSuggestion={handleAcceptSuggestion}
                />
              ))}

              {/* Systems section header */}
              <div className="flex items-center gap-2 mb-6 mt-8">
                <h2 className="text-base font-semibold text-gray-900">Systems</h2>
                <span className="text-xs text-gray-400">— 3 questions</span>
              </div>

              {/* Show the 3 systems questions */}
              {privacyAssessmentSections[1].questions.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  onAnswer={handleAnswer}
                  onClarify={handleClarify}
                  isActive={question.id === currentQuestionId}
                />
              ))}
            </div>
          </main>

          {/* Right: Copilot drawer */}
          <aside className="w-[440px] flex flex-col bg-white border-l border-gray-100 flex-shrink-0">
            <Tabs defaultValue="chat" className="flex flex-col h-full">
              {/* Tabs header */}
              <div className="border-b border-gray-100 px-2 pt-2 flex-shrink-0">
                <TabsList className="w-full bg-transparent p-0 gap-0 h-auto">
                  <TabsTrigger
                    value="chat"
                    className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs py-2.5 font-semibold"
                  >
                    Copilot chat
                  </TabsTrigger>
                  <TabsTrigger
                    value="tools"
                    className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs py-2.5 font-semibold"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Answer Generation
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="chat" className="flex flex-col flex-1 overflow-hidden mt-0 data-[state=inactive]:hidden">
                {/* Context badge */}
                <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-500">Assessment,</span>
                    <span className="text-xs font-semibold text-gray-700">Magellan Mobile</span>
                    <Button variant="ghost" size="icon" className="h-4 w-4 ml-auto">
                      <X className="w-3 h-3 text-gray-400" />
                    </Button>
                  </div>
                </div>

                {/* AI messages */}
                <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 space-y-3">
                  {/* Static progress message */}
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-[8px] font-bold">AI</span>
                    </div>
                    <div className="text-xs text-gray-700 leading-relaxed">
                      <strong className="text-gray-900">Good progress</strong>, 6 of 10 questions are complete. It's 62% ready for privacy approval thanks to the documents and assessments you selected.
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-[8px] font-bold">AI</span>
                    </div>
                    <div className="text-xs text-gray-700 leading-relaxed">
                      You can use these tools to generate answers, or have me guide you through the experience.
                    </div>
                  </div>

                  {/* Tool buttons */}
                  <div className="space-y-2 pl-7">
                    {[
                      { icon: Database, label: 'Edit data sources' },
                      { icon: Search, label: 'Kick off deep research' },
                      { icon: MessageCircle, label: 'Guide me through answering questions' },
                    ].map(({ icon: Icon, label }) => (
                      <button
                        key={label}
                        className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all duration-150 text-left"
                        onClick={label === 'Guide me through answering questions' ? () => {
                          setActiveGuide(allQuestions[0])
                          handleQuestionSelect(allQuestions[0].id)
                        } : undefined}
                      >
                        <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Guide History Bookmarks */}
                  {Object.entries(guideHistory).length > 0 && (
                    <div className="space-y-3 mt-4">
                      {Object.entries(guideHistory).map(([questionId, sessions]) => {
                        const question = allQuestions.find(q => q.id === questionId)
                        if (!question || sessions.length === 0) return null
                        
                        return (
                          <motion.div
                            key={questionId}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-r from-[#6673C7]/5 to-[#6673C7]/10 border border-[#6673C7]/20 rounded-xl overflow-hidden"
                          >
                            {/* Bookmark header */}
                            <div className="flex items-center gap-2 px-3 py-2 bg-[#6673C7]/10 border-b border-[#6673C7]/10">
                              <Bookmark className="w-3 h-3 text-[#6673C7] fill-[#6673C7]" />
                              <span className="text-[10px] font-semibold text-[#6673C7] uppercase tracking-wide">Guide Session</span>
                            </div>
                            
                            {/* Question context */}
                            <div className="px-3 py-2 border-b border-[#6673C7]/10">
                              <p className="text-[10px] text-gray-400">Question {question.number}</p>
                              <p className="text-xs font-medium text-gray-800 truncate">{question.title}</p>
                            </div>

                            {/* Sessions */}
                            <div className="divide-y divide-[#6673C7]/10">
                              {sessions.map((session, sessionIdx) => (
                                <div key={sessionIdx} className="px-3 py-2">
                                  {/* Timestamp */}
                                  <div className="flex items-center gap-1.5 mb-2">
                                    <Clock className="w-2.5 h-2.5 text-gray-400" />
                                    <span className="text-[10px] text-gray-400">
                                      {session.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  
                                  {/* Conversation preview */}
                                  <div className="space-y-1.5">
                                    {session.conversation.slice(0, 4).map((msg, msgIdx) => (
                                      <div key={msgIdx} className={`text-[11px] ${msg.role === 'user' ? 'text-gray-600 italic' : 'text-gray-700'}`}>
                                        <span className="text-[10px] text-gray-400 mr-1">{msg.role === 'user' ? 'You:' : 'AI:'}</span>
                                        <span className="line-clamp-2">{msg.content}</span>
                                      </div>
                                    ))}
                                    {session.conversation.length > 4 && (
                                      <p className="text-[10px] text-gray-400">+{session.conversation.length - 4} more messages</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Revisit button */}
                            <button
                              onClick={() => {
                                setActiveGuide(question)
                                handleQuestionSelect(question.id)
                              }}
                              className="w-full px-3 py-2 text-[10px] font-medium text-[#6673C7] bg-white/50 hover:bg-white transition-colors border-t border-[#6673C7]/10"
                            >
                              Continue this conversation
                            </button>
                          </motion.div>
                        )
                      })}
                    </div>
                  )}

                  {/* Guide tool — appears when Ask Copilot is clicked */}
                  <AnimatePresence>
                    {activeGuide && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.97 }}
                        transition={{ duration: 0.25 }}
                        className="bg-primary/5 border border-primary/20 rounded-xl p-3"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-1.5">
                            <Bot className="w-3.5 h-3.5 text-primary" />
                            <span className="text-xs font-semibold text-primary">Ask Copilot</span>
                          </div>
                          <button
                            onClick={() => {
                              // Save conversation to history if there was any user interaction (more than just AI intro)
                              const hasUserMessages = guideConversation.some(m => m.role === 'user')
                              if (hasUserMessages && activeGuide) {
                                setGuideHistory(prev => ({
                                  ...prev,
                                  [activeGuide.id]: [
                                    ...(prev[activeGuide.id] || []),
                                    {
                                      timestamp: new Date(),
                                      conversation: guideConversation.map(m => ({ role: m.role, content: m.content }))
                                    }
                                  ]
                                }))
                              }
                              setActiveGuide(null)
                              setGuideConversation([])
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Question context */}
                        <div className="bg-white/60 rounded-lg px-2.5 py-2 mb-3">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5">Question {activeGuide.number}</p>
                          <p className="text-xs font-semibold text-gray-800">{activeGuide.title}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <MessageCircle className="w-3 h-3 fill-[#6673C7] text-[#6673C7]" />
                            <span className="text-[10px] text-[#6673C7] font-medium">Review suggested answer</span>
                          </div>
                        </div>

                        {/* Conversation */}
                        <div className="space-y-3 max-h-[200px] overflow-y-auto">
                          {guideConversation.map((msg, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2 }}
                              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              {msg.role === 'user' ? (
                                <div className="bg-gray-100 rounded-xl rounded-tr-sm px-3 py-2 max-w-[85%]">
                                  <p className="text-xs text-gray-800">{msg.content}</p>
                                </div>
                              ) : (
                                <div className="max-w-[90%]">
                                  <p className="text-xs text-gray-700 leading-relaxed">{msg.content}</p>
                                  {msg.options && (
                                    <div className="mt-2 space-y-1.5">
                                      {msg.options.map((opt, i) => (
                                        <button
                                          key={opt.id}
                                          className="w-full text-left text-xs px-2.5 py-1.5 bg-white border border-gray-200 rounded-md hover:border-primary/40 hover:bg-primary/5 transition-colors"
                                        >
                                          <span className="text-gray-400 mr-1.5">{i + 1}.</span>
                                          <span className="text-gray-700">{opt.label}</span>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </motion.div>
                          ))}

                          {/* Typing indicator */}
                          {isGuideTyping && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="flex items-center gap-1 px-2 py-1.5"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Readiness summary - shows after all 3 suggestions accepted AND all 3 systems questions answered */}
                  <AnimatePresence>
                    {showGovernanceReadiness && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className="bg-white border border-gray-200 rounded-xl p-4 mt-2"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCheck className="w-4 h-4 text-primary" />
                          <p className="text-xs font-semibold text-gray-900">Governance readiness</p>
                        </div>
                        <div className="space-y-1.5 mb-4">
                          {[
                            `${readinessSummary.records} linked records created`,
                            `${readinessSummary.assessments} assessments launched`,
                            `${readinessSummary.complete}% complete automatically`,
                            `${readinessSummary.followUps} follow-ups remaining`,
                          ].map(line => (
                            <div key={line} className="flex items-center gap-2">
                              <div className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                              <p className="text-xs text-gray-700">{line}</p>
                            </div>
                          ))}
                          <div className="pt-1">
                            <p className="text-xs font-semibold text-primary">
                              Recommendation: {readinessSummary.recommendation}
                            </p>
                          </div>
                        </div>
                        <Button
                          className="w-full text-xs h-8"
                          size="sm"
                          onClick={() => navigate('/success')}
                        >
                          Submit for governance approval
                          <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div ref={chatBottomRef} />
                </div>

                {/* Input */}
                <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0">
                  {/* Guide tool mini card above input */}
                  <AnimatePresence>
                    {activeGuide && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        className="mb-2 bg-primary/5 border border-primary/20 rounded-lg px-3 py-2 flex items-center gap-2"
                      >
                        <Bot className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        <p className="text-xs text-primary font-medium truncate">
                          Chatting about: {activeGuide.title}
                        </p>
                        <button onClick={() => {
                          setActiveGuide(null)
                          setGuideConversation([])
                        }} className="ml-auto">
                          <X className="w-3 h-3 text-primary/60" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="relative bg-gray-50 border border-gray-200 rounded-xl focus-within:border-primary transition-colors duration-150">
                    <textarea
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          activeGuide ? handleGuideChatSend() : handleChatSend()
                        }
                      }}
                      placeholder="Ask Copilot"
                      rows={2}
                      className="w-full resize-none bg-transparent px-3 pt-2.5 pb-1 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none leading-relaxed"
                    />
                    <div className="flex items-center justify-between px-2 pb-2">
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400">
                        <Paperclip className="w-3 h-3" />
                      </Button>
                      <Button
                        onClick={activeGuide ? handleGuideChatSend : handleChatSend}
                        size="icon"
                        className="h-6 w-6 rounded-md bg-primary hover:bg-primary/90 disabled:opacity-30"
                        disabled={!chatInput.trim()}
                      >
                        <ArrowUp className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5 text-center">
                    AI can make mistakes. Verify info.{' '}
                    <button className="text-primary hover:underline">Learn more</button>
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="tools" className="flex-1 overflow-y-auto mt-0 px-4 py-4 data-[state=inactive]:hidden">
                <div className="space-y-4">
                  {/* Data Sources Card - at top */}
                  <DataSourcesCard />

                  {/* Tools section */}
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-2">Tools</p>
                    <div className="space-y-2">
                      {[
                        { icon: Search, label: 'Deep research', desc: 'Scan connected systems for relevant information' },
                        { icon: MessageCircle, label: 'Guided walkthrough', desc: 'Let Copilot explain each question in plain language' },
                      ].map(({ icon: Icon, label, desc }) => (
                        <button
                          key={label}
                          className="w-full flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-xl text-left hover:border-primary/40 hover:bg-primary/5 transition-all duration-150"
                        >
                          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-900">{label}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </aside>
        </div>
      </div>
    </div>
  )
}
