"use client"

import { useState, useEffect } from "react"
import useSWR from "swr";
import {
  Home, Package, Factory, Forklift, Calendar, ClipboardList, AlertTriangle,
  Download, Upload, MessageCircle, MenuIcon, X, Bot, CircleUserRound
} from "lucide-react"

import { Button } from "@/components/ui/button"

import ChatbotSidebar from "./components/chatbot-sidebar"
import UploadDialog from "./components/upload-dialog"
import HomePage from "./contents/page0"
import Page1 from "./contents/page1"
import Page2 from "./contents/page2"
import Page3 from "./contents/page3"
import Page4 from "./contents/page4"
import { downloadExcel } from "@/lib/download-excel";

// ------------------------------
// 0. CONSTANTS & UTILITIES
// ------------------------------

const IS_DEMO = true; // Set to true for demo mode

const TEAMS = [
  {name: "홈", icon: Home, content: HomePage},
  {name: "생산 계획 확인", icon: Calendar, content: Page1},
  {name: "재고 현황 조회", icon: Package, content: Page2},
  {name: "BOM 조회 및 수정", icon: Factory, content: Page3},
  {name: "Open PO 관리", icon: ClipboardList, content: Page4},
  // {name: "부족 자재 예측", icon: AlertTriangle, content: HomePage},
]

// ------------------------------
// 1. FETCH DATA
// ------------------------------

const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const err: any = new Error("HTTP error");
    err.status = res.status;

    try {
      err.info = await res.json();
    } catch {
      err.info = { message: res.statusText };
    }
    throw err;
  }

  return res.json();
}

// ------------------------------
// 2. MAIN
// ------------------------------

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [lastUpdate, setLastUpdate] = useState(["2025-11-14 17:30", "MRP_User01"]);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const nameInput = form.username as HTMLInputElement;

    setUsername(nameInput.value);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
  };

  const [selectedTeam, setSelectedTeam] = useState("홈");
  const [isTeamsExpanded, setIsTeamsExpanded] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isUploadOpen, setisUploadOpen] = useState(false);

  const team = TEAMS.find((team) => selectedTeam === team.name);
  const ContentComponent = team?.content ?? null;

  const kpi      = useSWR("/dashboard/api/data-kpi", fetcher);
  const forecast = useSWR("/dashboard/api/data-forecast", fetcher);

  const handleDownload = () => {
    if (!forecast || !kpi) {
      alert("데이터가 아직 로드되지 않았습니다.");
      return;
    }
    downloadExcel([forecast.data.filter, forecast.data.consumable], ["Filter Forecast", "Consumable Forecast"]);
  }
  
  return (
    isLoggedIn ? (
      // 대시보드 화면
      <div className="min-h-screen bg-gray-50 flex">
        {/* 팀 사이드바 */}
        <div className={`sticky left-0 top-0 h-screen bg-gray-900 text-white shadow-lg flex flex-col ${
            isTeamsExpanded ? 'w-64' : 'w-16'
          } transition-all duration-300 ease-in-out`}
        >
          <button onClick={() => setIsTeamsExpanded(!isTeamsExpanded)} className="focus:outline-none p-5">
            { isTeamsExpanded ? (<X size={22} />) : (<MenuIcon size={22} />) }
          </button>
          <>
            {TEAMS.map((team) => (
              <button
                key={team.name}
                onClick={() => setSelectedTeam(team.name)}
                className={`flex flex-row items-center p-5 w-full transition-colors duration-200 ${
                  selectedTeam === team.name ? 'bg-white text-black' : ''
                }`}
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <team.icon className="h-5 w-5" />
                </div>
                <div className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ml-4 ${
                    isTeamsExpanded ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0'
                  }`}
                >
                  {team.name}
                </div>
              </button>
            ))}
          </>
        </div>

        {/* 메인 대시보드 콘텐츠 */}
        <div className={`flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300 ${isChatOpen ? "mr-80" : "mr-0"}`}>
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* 헤더 */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              { IS_DEMO ? (
                <img src="/dashboard/logo.png" alt="logo" className="h-[3rem] w-auto" />
              ) : (
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">AI-MRP 대시보드</h1>
                  <p className="text-gray-600 mt-1">자재소요계획 및 재고 관리 시스템</p>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <div className="text-sm font-bold underline cursor-pointer hover:opacity-80 mr-2" onClick={handleLogout}>
                  {username}
                </div>
                <Button variant="outline" size="sm" onClick={() => setisUploadOpen(!isUploadOpen)}>
                  <Upload className="h-4 w-4 mr-2" />
                  업데이트
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  내보내기
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsChatOpen(!isChatOpen)}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  AI 어시스턴트
                </Button>
              </div>
            </div>

            {/* 콘텐츠 */}
            {ContentComponent && <ContentComponent kpi={kpi} forecast={forecast} lastUpdate={lastUpdate} />}
          </div>
        </div>

        {/* 파일 업로드 모달 */}
        <UploadDialog isOpen={isUploadOpen} onClose={() => {
          setisUploadOpen(false);
          setLastUpdate([new Date().toISOString().slice(0, 16).replace("T", " "), username]);
        }} />

        {/* AI 챗봇 사이드바 */}
        <ChatbotSidebar isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} isDemo={IS_DEMO} itemExample={forecast.data.filter[0].partNo} />
        {!isChatOpen && (
          <button className="fixed right-3 bottom-6 z-50 flex flex-col items-center" onClick={() => setIsChatOpen(true)}>
            <div className="relative mb-3 bg-white rounded-xl p-2 shadow-lg flex flex-col items-center text-xs text-gray-800
                            transition-opacity duration-700 ease-out animate-fade-in">
              <span className="whitespace-nowrap">AI 어시스턴트가</span>
              <span className="whitespace-nowrap">도와드릴게요!</span>
              <div className="absolute -bottom-2 w-0 h-0 border-t-8 border-t-white border-l-8 border-l-transparent border-r-8 border-r-transparent" />
            </div>
            <div className="bg-green-700 rounded-full w-14 h-14 shadow-lg flex items-center justify-center">
              <Bot className="stroke-white w-8 h-8" />
            </div>
          </button>
        )}
      </div>
    ) : (
      // 로그인 화면
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">로그인</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-gray-700 mb-2">사용자 이름</label>
              <input type="text" id="username" name="username" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>

            <div>
              <label htmlFor="password" className="block text-gray-700 mb-2">비밀번호</label>
              <input type="password" id="password" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>

            <Button type="submit" className="w-full">로그인</Button>
          </form>
        </div>
      </div>
    )
  );
}