"use client"

import { useChat } from 'ai/react';
import { Send, MessageCircle, Bot, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { useRef } from "react";

// ------------------------------
// 1. CHATBOT SIDEBAR
// ------------------------------

interface ChatbotSidebarProps {
  isOpen: boolean
  onClose: () => void
  isDemo: boolean
}

export default function ChatbotSidebar({ isOpen, onClose, isDemo }: ChatbotSidebarProps) {
  const initialMessages = isDemo ? [
    {
      id: "1",
      role: "assistant" as const,
      content:
        "안녕하세요! 저는 셀트리온 AI 어시스턴트입니다. 재고 조회, 생산 계획, 자재 소요량 관련 업무를 도와드릴 수 있습니다. 오늘 어떤 도움이 필요하신가요?",
    },
    // {
    //   id: "2",
    //   role: "user" as const,
    //   content: "현재 재고 부족 위험이 있는 품목들을 알려주세요.",
    // },
    // {
    //   id: "3",
    //   role: "assistant" as const,
    //   content:
    //     "현재 재고 수준을 기준으로 재고 부족 위험 상태인 품목은 다음과 같습니다:\n\n• RM3418-17-001 (Filter): 현재고 1개, 7월 예상 소요량 7개\n• RM3286-16-001 (Consumable): 현재고 0개, 7월 예상 소요량 16개\n\n조치가 필요할 경우, Open PO 확인 또는 추가 발주 여부를 안내해 드릴까요?",
    // },
  ] : [
    {
      id: "1",
      role: "assistant" as const,
      content:
        "안녕하세요! 저는 AI-MRP 어시스턴트입니다. 재고 조회, 생산 계획, 자재 소요량 관련 업무를 도와드릴 수 있습니다. 오늘 어떤 도움이 필요하신가요?",
    },
  ];

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/dashboard/api/chat',
    initialMessages,
    onError(err) {
      console.error('[useChat] onError →', err);
    },
    onResponse(res) {
      console.log('[useChat] response status', res.status);
      console.log('[useChat] response headers', Object.fromEntries(res.headers));
    },
  })
  
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + 2}px`;
  };

  const handleQuickAction = (prompt: string) => {
    handleInputChange({
      target: { value: prompt },
    } as unknown as React.ChangeEvent<HTMLInputElement>);

    requestAnimationFrame(() => {
      if (inputRef.current) {
        autoResize(inputRef.current);
        inputRef.current.focus();
        inputRef.current.setSelectionRange(prompt.length, prompt.length);
      }
    });
  };

  if (!isOpen) return null

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-lg z-50 flex flex-col">
      {/* 채팅 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-green-50">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-green-600" />
          { isDemo ? (
            <h3 className="font-semibold text-gray-900">셀트리온 AI 어시스턴트</h3>
          ) : (
            <h3 className="font-semibold text-gray-900">AI-MRP 어시스턴트</h3>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* 빠른 작업 */}
      <div className="p-4 border-b border-gray-100">
        <p className="text-xs text-gray-500 mb-2">빠른 작업:</p>
        <div className="flex flex-wrap gap-2">
          {/* <Button
            variant="outline"
            size="sm"
            className="text-xs bg-transparent"
            onClick={() => handleQuickAction("현재 재고 기준으로 입고 필요 상태에 있는 품목 목록과 부족 수량을 알려주세요.")}
          >
            입고 필요 품목
          </Button> */}
          <Button
            variant="outline"
            size="sm"
            className="text-xs bg-transparent"
            onClick={() => handleQuickAction("FT0000-004의 보유 재고 소진 날짜와 부족 수량을 알려주세요.")}
          >
            재고 소진 날짜
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs bg-transparent"
            onClick={() => handleQuickAction("FT0000-004의 추가 발주 필요 날짜와 추가 발주 필요량을 알려주세요.")}
          >
            발주 필요 날짜
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs bg-transparent"
            onClick={() => handleQuickAction("지금까지의 대화 내용을 markdown 표의 형식으로 요약해 주세요.")}
          >
            답변 내용 요약
          </Button>
        </div>
      </div>

      {/* 채팅 메시지 */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.role === "user" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-900"
                }`}
              >
                <p className="text-sm whitespace-pre-line">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (<div className="text-sm text-muted-foreground">AI 어시스턴스가 대답을 생성 중입니다…</div>)}
          {error && (<p className="mt-2 text-sm text-destructive">{error.message}</p>)}
        </div>
      </ScrollArea>

      {/* 채팅 입력 */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              handleInputChange(e as unknown as React.ChangeEvent<HTMLInputElement>);
              autoResize(e.currentTarget);
            }}
            placeholder="재고, 생산, 자재에 대해 질문하세요..."
            disabled={isLoading}
            className="flex-1 min-h-[40px] max-h-[100px] resize-none"
            autoComplete="off"
          />
          <Button disabled={!input.trim()} size="sm">
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <p className="text-xs text-gray-500 mt-2">Enter로 전송, Shift+Enter로 줄바꿈</p>
      </div>
    </div>
  )
}
