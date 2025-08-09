'use client';

import React, { useState } from 'react';
import { User, Bell, Shield, Palette, Globe, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ResponsiveCard } from '@/components/ui/responsive-card';
import { Switch } from '@/components/ui/switch';
import { useSession } from 'next-auth/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  // 프로필 설정
  const [profile, setProfile] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: '',
  });

  // 알림 설정
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    portfolio: true,
    price: true,
    news: false,
  });

  // 보안 설정
  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: '30',
  });

  // 테마 설정
  const [appearance, setAppearance] = useState({
    theme: 'light',
    language: 'ko',
  });

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      // API 호출 로직
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert('프로필이 저장되었습니다.');
    } catch (error) {
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">설정</h1>
        <p className="text-gray-600 dark:text-gray-400">계정 설정과 환경설정을 관리하세요</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">프로필</TabsTrigger>
          <TabsTrigger value="notifications">알림</TabsTrigger>
          <TabsTrigger value="security">보안</TabsTrigger>
          <TabsTrigger value="appearance">테마</TabsTrigger>
        </TabsList>

        {/* 프로필 설정 */}
        <TabsContent value="profile" className="space-y-4">
          <ResponsiveCard className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="h-5 w-5 text-gray-600" />
              <h2 className="text-xl font-semibold">프로필 설정</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="phone">전화번호</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="010-0000-0000"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>

              <Button onClick={handleSaveProfile} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                저장
              </Button>
            </div>
          </ResponsiveCard>
        </TabsContent>

        {/* 알림 설정 */}
        <TabsContent value="notifications" className="space-y-4">
          <ResponsiveCard className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="h-5 w-5 text-gray-600" />
              <h2 className="text-xl font-semibold">알림 설정</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">이메일 알림</p>
                  <p className="text-sm text-gray-600">중요한 알림을 이메일로 받습니다</p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, email: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">포트폴리오 알림</p>
                  <p className="text-sm text-gray-600">포트폴리오 변동사항 알림</p>
                </div>
                <Switch
                  checked={notifications.portfolio}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, portfolio: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">가격 알림</p>
                  <p className="text-sm text-gray-600">설정한 가격 도달 시 알림</p>
                </div>
                <Switch
                  checked={notifications.price}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, price: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">뉴스 알림</p>
                  <p className="text-sm text-gray-600">관련 뉴스 알림</p>
                </div>
                <Switch
                  checked={notifications.news}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, news: checked })
                  }
                />
              </div>
            </div>
          </ResponsiveCard>
        </TabsContent>

        {/* 보안 설정 */}
        <TabsContent value="security" className="space-y-4">
          <ResponsiveCard className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-5 w-5 text-gray-600" />
              <h2 className="text-xl font-semibold">보안 설정</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">2단계 인증</p>
                  <p className="text-sm text-gray-600">추가 보안을 위한 2단계 인증</p>
                </div>
                <Switch
                  checked={security.twoFactor}
                  onCheckedChange={(checked) => setSecurity({ ...security, twoFactor: checked })}
                />
              </div>

              <div>
                <Label htmlFor="timeout">세션 타임아웃 (분)</Label>
                <select
                  id="timeout"
                  className="w-full px-3 py-2 border rounded-md"
                  value={security.sessionTimeout}
                  onChange={(e) => setSecurity({ ...security, sessionTimeout: e.target.value })}
                >
                  <option value="15">15분</option>
                  <option value="30">30분</option>
                  <option value="60">1시간</option>
                  <option value="120">2시간</option>
                </select>
              </div>

              <div className="pt-4">
                <Button variant="outline" className="w-full">
                  비밀번호 변경
                </Button>
              </div>
            </div>
          </ResponsiveCard>
        </TabsContent>

        {/* 테마 설정 */}
        <TabsContent value="appearance" className="space-y-4">
          <ResponsiveCard className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Palette className="h-5 w-5 text-gray-600" />
              <h2 className="text-xl font-semibold">테마 설정</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="theme">테마</Label>
                <select
                  id="theme"
                  className="w-full px-3 py-2 border rounded-md"
                  value={appearance.theme}
                  onChange={(e) => setAppearance({ ...appearance, theme: e.target.value })}
                >
                  <option value="light">라이트</option>
                  <option value="dark">다크</option>
                  <option value="system">시스템 설정 따르기</option>
                </select>
              </div>

              <div>
                <Label htmlFor="language">언어</Label>
                <select
                  id="language"
                  className="w-full px-3 py-2 border rounded-md"
                  value={appearance.language}
                  onChange={(e) => setAppearance({ ...appearance, language: e.target.value })}
                >
                  <option value="ko">한국어</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </ResponsiveCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
