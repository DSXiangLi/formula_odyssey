import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useGameStore } from '@stores/gameStore'
import ValleyScene from '@components/scene/ValleyScene'
import ExploreModal from '@components/explore/ExploreModal'
import CollectionModal from '@components/collection/CollectionModal'
import MedicineDetail from '@components/collection/MedicineDetail'
import Navigation from '@components/ui/Navigation'
import ExploreButton from '@components/ui/ExploreButton'
import CollectionButton from '@components/ui/CollectionButton'
import FormulaPursuitPanel from '@components/formula/FormulaPursuit'
import ClinicalCaseComponent from '@components/clinical/ClinicalCase'

function App() {
  const {
    isExploreOpen,
    isCollectionOpen,
    isFormulaPursuitOpen,
    isClinicalCaseOpen,
    selectedMedicine,
    currentCase,
    setExploreOpen,
    setCollectionOpen,
    setFormulaPursuitOpen,
    setClinicalCaseOpen,
    setSelectedMedicine,
    login,
  } = useGameStore()

  // 登录处理
  useEffect(() => {
    const result = login()
    if (result.isNewDay) {
      // 显示每日奖励提示
      console.log('每日登录奖励:', result.rewards)
    }
  }, [])

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background-primary">
      {/* 主场景 */}
      <ValleyScene />

      {/* 导航栏 */}
      <Navigation />

      {/* 探索按钮 */}
      <ExploreButton />

      {/* 图鉴按钮 */}
      <CollectionButton />

      {/* 探索模态框 */}
      <AnimatePresence>
        {isExploreOpen && (
          <ExploreModal onClose={() => setExploreOpen(false)} />
        )}
      </AnimatePresence>

      {/* 图鉴模态框 */}
      <AnimatePresence>
        {isCollectionOpen && (
          <CollectionModal onClose={() => setCollectionOpen(false)} />
        )}
      </AnimatePresence>

      {/* 药灵详情 */}
      <AnimatePresence>
        {selectedMedicine && (
          <MedicineDetail
            medicineId={selectedMedicine}
            onClose={() => setSelectedMedicine(null)}
          />
        )}
      </AnimatePresence>

      {/* 方剂追缉令 */}
      <AnimatePresence>
        {isFormulaPursuitOpen && (
          <FormulaPursuitPanel onClose={() => setFormulaPursuitOpen(false)} />
        )}
      </AnimatePresence>

      {/* 临床实习 */}
      <AnimatePresence>
        {isClinicalCaseOpen && currentCase && (
          <ClinicalCaseComponent
            caseId={currentCase}
            onClose={() => setClinicalCaseOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
