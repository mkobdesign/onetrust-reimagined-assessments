import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import HomePage from '@/pages/HomePage'
import AgentCanvas from '@/pages/AgentCanvas'
import AssessmentPreLaunch from '@/pages/AssessmentPreLaunch'
import AssessmentQuestionnaire from '@/pages/AssessmentQuestionnaire'
import SuccessScreen from '@/pages/SuccessScreen'

export default function App() {
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/canvas" element={<AgentCanvas />} />
          <Route path="/prelaunch" element={<AssessmentPreLaunch />} />
          <Route path="/questionnaire" element={<AssessmentQuestionnaire />} />
          <Route path="/success" element={<SuccessScreen />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  )
}
