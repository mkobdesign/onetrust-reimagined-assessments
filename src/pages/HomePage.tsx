import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { ArrowUp, Plus, FileText, Shield, FolderOpen, Users } from 'lucide-react'
import { motion } from 'framer-motion'

const quickActions = [
  'Add a vendor',
  'Scope a project',
  'Start a risk assessment',
]

// Card data with tables
const cardData = [
  {
    icon: FileText,
    label: 'Assessments',
    path: '/assessments',
    actionLabel: 'Launch with template',
    items: [
      { name: 'OWASP Top Ten Assessment V1.0', type: 'INCIDENT', version: 'V 2' },
      { name: 'tareq 2.1', type: 'PIA', version: 'V 2' },
      { name: 'Assess Issue', type: 'ITRM', version: 'V 1' },
      { name: 'LD Create Issue Template', type: 'ITRM', version: 'V 1' },
    ],
  },
  {
    icon: Shield,
    label: 'Vendors',
    path: '/vendors',
    actionLabel: 'View',
    items: [
      { name: 'Salesforce Enterprise', type: 'CRM', version: 'V 3' },
      { name: 'AWS Cloud Services', type: 'INFRA', version: 'V 2' },
      { name: 'Zendesk Support', type: 'SUPPORT', version: 'V 1' },
      { name: 'Slack Communications', type: 'COMMS', version: 'V 2' },
    ],
  },
  {
    icon: FolderOpen,
    label: 'Documents',
    path: '/documents',
    actionLabel: 'View',
    items: [
      { name: 'Privacy Policy 2024', type: 'POLICY', version: 'V 4' },
      { name: 'Data Retention Guidelines', type: 'GUIDE', version: 'V 2' },
      { name: 'Incident Response Plan', type: 'PROC', version: 'V 3' },
      { name: 'GDPR Compliance Checklist', type: 'CHECK', version: 'V 1' },
    ],
  },
  {
    icon: Users,
    label: 'Engagements',
    path: '/engagements',
    actionLabel: 'Start',
    items: [
      { name: 'Q1 Security Review', type: 'REVIEW', version: 'V 1' },
      { name: 'Vendor Onboarding - Stripe', type: 'ONBOARD', version: 'V 2' },
      { name: 'Annual Audit 2024', type: 'AUDIT', version: 'V 1' },
      { name: 'DPIA - Marketing Analytics', type: 'DPIA', version: 'V 1' },
    ],
  },
]





const defaultPrompt = "We want to deploy ChatGPT Enterprise for support agents to summarize tickets, suggest customer replies, and search Confluence articles. It may use ticket data, customer names, account metadata, and escalation notes."

export default function HomePage() {
  const [prompt, setPrompt] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [hasClickedOnce, setHasClickedOnce] = useState(false)
  const navigate = useNavigate()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = () => {
    // First click: fill in the default prompt
    if (!hasClickedOnce && !prompt.trim()) {
      setPrompt(defaultPrompt)
      setHasClickedOnce(true)
      textareaRef.current?.focus()
      return
    }
    // Second click (or if prompt already has content): navigate
    if (!prompt.trim()) return
    navigate('/canvas', { state: { initialPrompt: prompt } })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleQuickAction = (action: string) => {
    if (action === 'Assess a processing activity') {
      setPrompt('We want to deploy ChatGPT Enterprise for support agents to summarize tickets, suggest customer replies, and search Confluence articles. It may use ticket data, customer names, account metadata, and escalation notes.')
      textareaRef.current?.focus()
    } else {
      setPrompt(action)
      textareaRef.current?.focus()
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar title="Self Service Portal" />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 pt-20 pb-16">
            {/* Hero prompt */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-8 tracking-tight">
                Have Copilot do it for you.
              </h2>

              {/* Prompt input */}
              <div
                className={`relative bg-white rounded-xl border transition-all duration-200 ${isFocused
                  ? 'border-primary shadow-md shadow-primary/5'
                  : 'border-gray-200 shadow-sm'
                  }`}
              >
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Copilot"
                  aria-label="Ask Copilot"
                  rows={3}
                  className="w-full resize-none bg-transparent px-4 pt-4 pb-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none leading-relaxed"
                />

                <div className="flex items-center justify-between px-3 pb-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-gray-700"
                    aria-label="Attach files"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>

                  <Button
                    onClick={handleSubmit}
                    disabled={hasClickedOnce && !prompt.trim()}
                    size="icon"
                    className="h-8 w-8 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    aria-label="Send message"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Disclaimer */}
              {/* <p className="text-xs text-gray-400 mt-2 text-center">
                AI can make mistakes. Verify info.{' '}
                <button className="text-primary hover:underline inline-flex items-center gap-0.5">
                  Learn more <ExternalLink className="w-3 h-3" />
                </button>
              </p> */}

              {/* Quick actions */}
              <div className="flex flex-wrap gap-2 mt-6 justify-center">
                {quickActions.map(action => (
                  <button
                    key={action}
                    onClick={() => handleQuickAction(action)}
                    className="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-full hover:border-gray-300 hover:text-gray-900 transition-all duration-150 hover:shadow-sm"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </motion.div>


          </div>

          {/* Quick Links - wider section */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.2 }}
            className="max-w-6xl mx-auto px-6 pb-16"
          >
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Your stuff
            </h3>
            <div className="grid grid-cols-4 gap-4">
              {cardData.map((card) => (
                <div
                  key={card.label}
                  className="group/card bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all duration-150"
                >
                  {/* Card header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <button
                      onClick={() => navigate(card.path)}
                      className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                    >
                      <card.icon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-semibold text-gray-900">{card.label}</span>
                    </button>
                    <button
                      onClick={() => navigate(card.path)}
                      className="text-xs text-primary font-medium opacity-0 group-hover/card:opacity-100 transition-opacity hover:underline"
                    >
                      See all
                    </button>
                  </div>

                  {/* Table */}
                  <div className="divide-y divide-gray-100">
                    {card.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="relative group px-4 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-900 truncate pr-6">{item.name}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded font-medium">
                              {item.type}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded font-medium">
                              {item.version}
                            </span>
                          </div>
                        </div>

                        {/* Hover action button */}
                        <button
                          className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity px-2.5 py-1 bg-primary text-white text-[10px] font-medium rounded-md hover:bg-primary/90 whitespace-nowrap"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(card.path)
                          }}
                        >
                          {card.actionLabel}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
