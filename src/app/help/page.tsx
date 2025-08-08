'use client';

import React, { useState } from 'react';
import { HelpCircle, Book, MessageCircle, Mail, Phone, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ResponsiveCard } from '@/components/ui/responsive-card';
import { cn } from '@/lib/utils';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    id: '1',
    category: '시작하기',
    question: 'FLUX AI Capital은 어떤 서비스인가요?',
    answer: 'FLUX AI Capital은 AI 기반의 전략적 자산관리 플랫폼입니다. 개인 투자자들이 전문가 수준의 포트폴리오 관리, 백테스팅, 리스크 분석 등을 활용할 수 있도록 도와드립니다.',
  },
  {
    id: '2',
    category: '시작하기',
    question: '어떻게 시작하나요?',
    answer: '회원가입 후 첫 포트폴리오를 생성하시면 됩니다. 포트폴리오 메뉴에서 "새 포트폴리오" 버튼을 클릭하고, 투자 목적에 맞는 이름과 설명을 입력해주세요.',
  },
  {
    id: '3',
    category: '포트폴리오',
    question: '포트폴리오는 몇 개까지 만들 수 있나요?',
    answer: '기본 계정은 최대 5개의 포트폴리오를 생성할 수 있습니다. 프리미엄 계정은 무제한으로 포트폴리오를 생성할 수 있습니다.',
  },
  {
    id: '4',
    category: '포트폴리오',
    question: '거래 내역은 어떻게 입력하나요?',
    answer: '포트폴리오 상세 페이지에서 "거래 추가" 버튼을 클릭하여 매수, 매도, 입금, 출금 등의 거래를 입력할 수 있습니다. CSV 파일로 일괄 업로드도 가능합니다.',
  },
  {
    id: '5',
    category: '백테스팅',
    question: '백테스팅은 무엇인가요?',
    answer: '백테스팅은 과거 데이터를 바탕으로 투자 전략의 성과를 시뮬레이션하는 기능입니다. 다양한 전략을 테스트해보고 최적의 투자 방법을 찾을 수 있습니다.',
  },
  {
    id: '6',
    category: '백테스팅',
    question: '어떤 전략들을 테스트할 수 있나요?',
    answer: '모멘텀, 평균회귀, 밸류 투자 등 다양한 전략을 제공합니다. 또한 사용자가 직접 커스텀 전략을 만들어 테스트할 수도 있습니다.',
  },
  {
    id: '7',
    category: '요금',
    question: '서비스 이용료는 얼마인가요?',
    answer: '기본 기능은 무료로 이용 가능합니다. 고급 분석, 실시간 알림, API 연동 등의 프리미엄 기능은 월 29,900원에 이용하실 수 있습니다.',
  },
  {
    id: '8',
    category: '보안',
    question: '내 데이터는 안전한가요?',
    answer: '모든 데이터는 암호화되어 저장되며, 2단계 인증을 통해 계정을 보호합니다. 또한 정기적인 보안 감사를 실시하여 안전성을 보장합니다.',
  },
];

const categories = ['전체', '시작하기', '포트폴리오', '백테스팅', '요금', '보안'];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const filteredFAQ = faqData.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === '전체' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          도움말 센터
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          자주 묻는 질문과 사용 가이드를 확인하세요
        </p>
      </div>

      {/* 검색 바 */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          type="text"
          placeholder="질문을 검색하세요..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* 카테고리 필터 */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* FAQ 목록 */}
      <div className="space-y-4 mb-12">
        <h2 className="text-xl font-semibold mb-4">자주 묻는 질문</h2>
        
        {filteredFAQ.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            검색 결과가 없습니다.
          </p>
        ) : (
          filteredFAQ.map((item) => (
            <ResponsiveCard key={item.id} className="p-4">
              <button
                className="w-full text-left flex items-start justify-between gap-4"
                onClick={() => toggleExpand(item.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    {item.question}
                  </h3>
                </div>
                {expandedItems.includes(item.id) ? (
                  <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              
              {expandedItems.includes(item.id) && (
                <p className="mt-3 text-gray-600 dark:text-gray-400 pl-0">
                  {item.answer}
                </p>
              )}
            </ResponsiveCard>
          ))
        )}
      </div>

      {/* 추가 도움말 섹션 */}
      <div className="grid gap-6 md:grid-cols-3">
        <ResponsiveCard className="p-6 text-center">
          <Book className="h-10 w-10 text-blue-600 mx-auto mb-3" />
          <h3 className="font-semibold mb-2">사용 가이드</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            상세한 사용 방법을 확인하세요
          </p>
          <Button variant="outline" size="sm" className="w-full">
            가이드 보기
          </Button>
        </ResponsiveCard>

        <ResponsiveCard className="p-6 text-center">
          <MessageCircle className="h-10 w-10 text-green-600 mx-auto mb-3" />
          <h3 className="font-semibold mb-2">실시간 채팅</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            고객센터와 실시간으로 상담하세요
          </p>
          <Button variant="outline" size="sm" className="w-full">
            채팅 시작
          </Button>
        </ResponsiveCard>

        <ResponsiveCard className="p-6 text-center">
          <Mail className="h-10 w-10 text-purple-600 mx-auto mb-3" />
          <h3 className="font-semibold mb-2">이메일 문의</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            복잡한 문의는 이메일로 보내주세요
          </p>
          <Button variant="outline" size="sm" className="w-full">
            이메일 보내기
          </Button>
        </ResponsiveCard>
      </div>

      {/* 연락처 정보 */}
      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4">고객센터</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-gray-400" />
            <div>
              <p className="font-medium">전화</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">1544-0000 (평일 09:00-18:00)</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-gray-400" />
            <div>
              <p className="font-medium">이메일</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">support@flux.ai.kr</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}