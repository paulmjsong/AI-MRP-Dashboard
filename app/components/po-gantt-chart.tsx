'use client'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { differenceInCalendarDays, parseISO, isBefore, format } from "date-fns"
import { AlertCircle, CheckCircle } from "lucide-react"

interface PO {
    poNumber: string;
    itemCode: string;
    requester: string;
    supplier: string;
    orderDate: string;
    expectedDate: string;
    orderQty: number;
    receivedQty: number;
    remainingQty: number;
    unit: string;
    plant: string;
}

interface Props {
  data: PO[];
  minDate: Date;
  maxDate: Date;
}

export default function POTimeline({ data, minDate, maxDate }: Props) {
  const today = new Date();
  const totalDays = differenceInCalendarDays(maxDate, minDate) + 1;

  return (
    <TooltipProvider delayDuration={200}>
      {/* ---------- 범례 ---------- */}
      <div className="mb-4 flex items-center gap-6 text-sm">
        <div className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 bg-green-500/80 rounded" />
          <span>정상 진행</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 bg-red-500/80 rounded" />
          <span>지연(Overdue)</span>
        </div>
      </div>

      {/* ---------- 세로∙가로 스크롤 영역 ---------- */}
      <div className="max-h-96 overflow-y-auto">
        <ScrollArea className="w-full">
          <div className="space-y-5 min-w-[600px] px-2">

            {/* ===== 날짜 눈금 ===== */}
            <div className="relative h-8 sticky top-0 bg-white z-10">
              {/* 축선 */}
              <div className="absolute inset-y-1/2 w-full border-t border-dashed border-gray-300" />

              {/* 시작·끝 날짜 라벨 */}
              <span className="absolute -top-4 left-0 text-xs text-gray-500">
                {format(minDate, "MM/dd")}
              </span>
              <span className="absolute -top-4 right-0 text-xs text-gray-500">
                {format(maxDate, "MM/dd")}
              </span>
            </div>

            {/* ===== PO 막대들 ===== */}
            {data.map((po, idx) => {
              const start = differenceInCalendarDays(parseISO(po.orderDate), minDate)
              const duration = differenceInCalendarDays(parseISO(po.expectedDate), parseISO(po.orderDate)) + 1
              const isOverdue = isBefore(parseISO(po.expectedDate), today)

              return (
                <div key={idx} className="flex items-center gap-3">
                  {/* 레이블 */}
                  <div className="w-28 flex-shrink-0 text-sm font-medium">
                    {po.itemCode}
                  </div>

                  {/* 타임라인 바 */}
                  <div className="relative h-6 flex-1 bg-gray-100 rounded">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`absolute h-6 rounded transition-all duration-300
                            ${isOverdue ? "bg-red-500/80" : "bg-green-500/80"}`}
                          style={{
                            left: `${(start / totalDays) * 100}%`,
                            width: `${(duration / totalDays) * 100}%`,
                          }}
                        />
                      </TooltipTrigger>

                      <TooltipContent className="px-4 py-3 text-sm" role="dialog">
                        <div className="flex items-center gap-2 mb-1">
                          {isOverdue
                            ? <AlertCircle className="h-4 w-4 text-red-500" />
                            : <CheckCircle className="h-4 w-4 text-green-500" />}
                          <span className="font-semibold">{po.itemCode}</span>
                        </div>
                        <div><strong>PO 번호:</strong> {po.poNumber}</div>
                        <div><strong>발주량:</strong> {po.orderQty}</div>
                        <div><strong>주문일:</strong> {format(parseISO(po.orderDate), "yyyy-MM-dd")}</div>
                        <div><strong>입고예정:</strong> {format(parseISO(po.expectedDate), "yyyy-MM-dd")}</div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </div>
    </TooltipProvider>
  )
}