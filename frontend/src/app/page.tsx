import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-5xl w-full">
        <h1 className="text-6xl font-bold text-center mb-8">
          FluxAI Capital
        </h1>
        <p className="text-xl text-center mb-12 text-gray-600">
          AI 기반 차세대 자산운용 플랫폼
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-3">포트폴리오 관리</h2>
            <p className="text-gray-600 mb-4">
              AI가 최적화한 포트폴리오로 안정적인 수익 추구
            </p>
            <Link href="/dashboard" className="text-blue-600 hover:underline">
              대시보드 바로가기 →
            </Link>
          </div>
          
          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-3">리스크 모니터링</h2>
            <p className="text-gray-600 mb-4">
              실시간 리스크 분석으로 안전한 자산 운용
            </p>
            <Link href="/risk" className="text-blue-600 hover:underline">
              리스크 분석 →
            </Link>
          </div>
          
          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-3">성과 분석</h2>
            <p className="text-gray-600 mb-4">
              상세한 성과 분석과 귀인분석 제공
            </p>
            <Link href="/performance" className="text-blue-600 hover:underline">
              성과 확인 →
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}