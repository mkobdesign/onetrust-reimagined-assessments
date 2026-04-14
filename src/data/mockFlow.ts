export type MessageRole = 'user' | 'assistant'

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  timestamp?: string
  files?: UploadedFile[]
  isTyping?: boolean
  progress?: { current: number; total: number; label: string }
}

export interface UploadedFile {
  name: string
  type: string
  size: string
}

export interface GovernanceRecord {
  id: string
  label: string
  type: string
  values: string[]
  icon: string
}

export interface AssessmentCard {
  id: string
  title: string
  type: 'privacy' | 'security' | 'third-party' | 'ai-risk'
  status: 'draft' | 'in-progress'
  owner: string
  ownerInitials: string
  riskLevel: 'low' | 'medium' | 'high' | 'very-high'
  progress: number
  questionsAnswered: number
  totalQuestions: number
  prefilled: string[]
}

// Each step in the conversation reveals more canvas content
export const conversationSteps: ChatMessage[][] = [
  // Step 0: Initial state - empty
  [],

  // Step 1: After user submits initial prompt
  [
    {
      id: 'u1',
      role: 'user',
      content:
        'We want to deploy ChatGPT Enterprise for support agents to summarize tickets, suggest customer replies, and search Confluence articles. It may use ticket data, customer names, account metadata, and escalation notes.',
    },
    {
      id: 'a1',
      role: 'assistant',
      content:
        "I've created your project and started mapping the governance requirements. Please upload any supporting documents - DPA, vendor security overview, architecture diagram, sample prompts, or support policy SOP.",
      progress: { current: 1, total: 4, label: 'Analyzing your initiative' },
    },
  ],

  // Step 2: Upload files
  [
    {
      id: 'u2',
      role: 'user',
      content: "Here are the relevant documents.",
      files: [
        { name: 'OpenAI_DPA_2024.pdf', type: 'pdf', size: '2.4 MB' },
        { name: 'Vendor_Security_Overview.pdf', type: 'pdf', size: '1.1 MB' },
        { name: 'Architecture_Diagram.png', type: 'image', size: '840 KB' },
        { name: 'Sample_Prompts.docx', type: 'doc', size: '156 KB' },
        { name: 'Support_SOP.pdf', type: 'pdf', size: '3.2 MB' },
      ],
    },
    {
      id: 'a2',
      role: 'assistant',
      content:
        "I've read your uploaded documents. Building governance records now…",
      progress: { current: 2, total: 4, label: 'Creating governance records' },
    },
    {
      id: 'a3',
      role: 'assistant',
      content:
        '**Will the AI outputs be shown to customers?** For example, will suggested replies be sent directly, or do agents review them first?',
    },
  ],

  // Step 3: Customer-facing + human review
  [
    {
      id: 'u4',
      role: 'user',
      content: 'Agents review everything before sending. The AI just suggests — no direct sends.',
    },
    {
      id: 'a4',
      role: 'assistant',
      content:
        "That's important — I've marked human-in-the-loop as required. \n\n**Are there any regulatory requirements we should be aware of?** For example, GDPR, CCPA, or industry-specific rules?",
    },
  ],

  // Step 4: User answers regulatory requirements
  [
    {
      id: 'u5',
      role: 'user',
      content: "We operate in the EU and US, so GDPR and CCPA apply. We're also ISO 27001 certified.",
    },
    {
      id: 'a5',
      role: 'assistant',
      content:
        "Great, I've noted GDPR and CCPA compliance requirements.\n\nI have **2 quick questions about data retention** that will help me progress 3 assessments at once:\n\n**1. How long will conversation data be retained?**\n**2. Where will the data be stored geographically?**",
      affectedAssessments: ['privacy', 'security', 'third-party'],
    },
  ],

  // Step 5: Data retention answer + assessments generated
  [
    {
      id: 'u6',
      role: 'user',
      content: 'We retain data for 90 days, stored in US-West and EU-Frankfurt regions.',
    },
    {
      id: 'a6',
      role: 'assistant',
      content:
        "Perfect — those answers just completed 3 questions across your Privacy, Security, and Third-Party assessments. I'm now generating your linked risk assessments.",
      progress: { current: 4, total: 4, label: 'Generating assessments' },
      completedAssessments: ['third-party'],
      highlightAssessments: ['privacy', 'security', 'third-party'],
      todoList: [
        { id: 'todo1', label: 'Complete the Privacy Impact Assessment', status: 'pending' },
        { id: 'todo2', label: 'Review AI Risk Assessment findings', status: 'pending' },
        { id: 'todo3', label: 'Verify vendor security documentation', status: 'pending' },
        { id: 'todo4', label: 'Submit for stakeholder approval', status: 'pending' },
      ],
    },
  ],
]

export const governanceRecords: GovernanceRecord[] = [
  {
    id: 'ai-initiative',
    label: 'AI Initiative',
    type: 'Initiative',
    values: ['Customer Support Copilot for Zendesk'],
    icon: 'zap',
  },
  {
    id: 'ai-agent',
    label: 'AI Agent',
    type: 'Agent',
    values: ['Customer Support Response Assistant'],
    icon: 'bot',
  },
  {
    id: 'models',
    label: 'Models',
    type: 'AI Models',
    values: ['GPT-4o', 'Glean Retrieval'],
    icon: 'cpu',
  },
  {
    id: 'vendors',
    label: 'Vendors',
    type: 'Third Parties',
    values: ['OpenAI', 'Glean'],
    icon: 'building2',
  },
  {
    id: 'systems',
    label: 'Systems',
    type: 'Connected Systems',
    values: ['Zendesk', 'Slack', 'Confluence'],
    icon: 'layers',
  },
  {
    id: 'processing',
    label: 'Processing Activity',
    type: 'Data Activity',
    values: ['Support Ticket Assistance'],
    icon: 'database',
  },
  {
    id: 'data-assets',
    label: 'Data Assets',
    type: 'Personal Data',
    values: ['Customer Support Tickets', 'Account Metadata'],
    icon: 'shield',
  },
  {
    id: 'engagement',
    label: 'Engagement',
    type: 'Review Type',
    values: ['Unified Governance Review'],
    icon: 'clipboard-check',
  },
]

export const assessmentCards: AssessmentCard[] = [
  {
    id: 'privacy',
    title: 'Privacy Impact Assessment',
    type: 'privacy',
    status: 'in-progress',
    owner: 'Sarah Chen',
    ownerInitials: 'SC',
    riskLevel: 'medium',
    progress: 72,
    questionsAnswered: 18,
    totalQuestions: 25,
    prefilled: [
      'Personal data types detected',
      'Purpose compatibility mapped',
      'Notice / consent impact identified',
      'Retention schedule applied',
    ],
  },
  {
    id: 'security',
    title: 'Security Risk Assessment',
    type: 'security',
    status: 'in-progress',
    owner: 'Marcus Reid',
    ownerInitials: 'MR',
    riskLevel: 'low',
    progress: 60,
    questionsAnswered: 12,
    totalQuestions: 20,
    prefilled: [
      'SSO requirement flagged',
      'RBAC controls identified',
      'Tenant isolation reviewed',
      'Audit logging confirmed',
    ],
  },
  {
    id: 'third-party',
    title: 'Third-Party Risk Assessment',
    type: 'third-party',
    status: 'in-progress',
    owner: 'Keisha Park',
    ownerInitials: 'KP',
    riskLevel: 'low',
    progress: 80,
    questionsAnswered: 16,
    totalQuestions: 20,
    prefilled: [
      'Training opt-out confirmed (DPA)',
      'Retention policy reviewed',
      'Subprocessors listed',
      'DPA coverage verified',
    ],
  },
  {
    id: 'ai-risk',
    title: 'AI Risk Assessment',
    type: 'ai-risk',
    status: 'in-progress',
    owner: 'Jordan Lee',
    ownerInitials: 'JL',
    riskLevel: 'medium',
    progress: 55,
    questionsAnswered: 11,
    totalQuestions: 20,
    prefilled: [
      'Hallucination risk: Medium',
      'Customer impact: Indirect only',
      'Human-in-the-loop: Required',
      'Explainability: Partial',
    ],
  },
]

export const dataSources = [
  {
    id: 'dpa',
    name: 'OpenAI_DPA_2024.pdf',
    type: 'Contract Document',
    icon: 'file-text',
    note: 'Used to confirm training opt-out and data retention terms',
    confidence: 98,
  },
  {
    id: 'security',
    name: 'Vendor_Security_Overview.pdf',
    type: 'Security Document',
    icon: 'file-text',
    note: 'Mapped to security controls and SSO requirements',
    confidence: 94,
  },
  {
    id: 'architecture',
    name: 'Zendesk Risk Assessment',
    type: 'Privacy Assessment',
    icon: 'audit',
    note: 'Completed March 15, 2024',
    confidence: 87,
  },
  {
    id: 'prompts',
    name: 'Sample_Prompts.docx',
    type: 'Usage Examples',
    icon: 'file-text',
    note: 'Analyzed for personal data exposure and output risk',
    confidence: 91,
  },
  {
    id: 'sop',
    name: 'Support_SOP.pdf',
    type: '/processes',
    icon: 'sharepoint',
    note: 'Human review workflow confirmed from this document',
    confidence: 96,
  },
]
