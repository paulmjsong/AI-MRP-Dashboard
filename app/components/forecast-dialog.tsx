"use client"

import {
  LineChart,
  Line,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { JSX } from "react"

// ------------------------------
// 0. TYPES & UTILITIES
// ------------------------------

type ForecastItem = {
  partNo:         string;
  backupPartNos:  string[];
  category:       string;
  currentStock:   number;
  totalStock:     number;
  openPO:         number;
  monthlyUsage:   number[];
  monthlyExpiry:  number[];
  monthlyReceipt: number[];
  expectedTotal:  number[];
  expectedWithPO: number[];
  neededActions: ("발주" | "입고")[][];
}

function getActionsColor(actions: string) {
  if (actions.includes("발주")) return "bg-red-100 text-red-800";
  if (actions.includes("입고")) return "bg-yellow-100 text-yellow-800";
  return "bg-green-100 text-green-800";
}

// ------------------------------
// 1. DIALOG
// ------------------------------

interface ForecastDialogProps {
  isOpen: boolean
  onClose: () => void
  selectedItem: ForecastItem | null
}

export default function ForecastDialog({ isOpen, onClose, selectedItem }: ForecastDialogProps) {
  if (!selectedItem) return null;

  const currDate  = new Date();
  const currYear  = currDate.getUTCFullYear();  // full year in UTC (2025 = 2025)
  const currMonth = currDate.getMonth();        // zero-based index (0 = January)

  const rows: JSX.Element[] = [];
  const points: { month: string; stock: number }[] = [];

  const MAX_FORECAST = selectedItem.monthlyUsage.length

  for (let i = 0; i < MAX_FORECAST; i++) {
    const year = (currMonth + i > 11) ? currYear + 1 : currYear;
    const month = (currMonth + i) % 12 + 1;
    const date = `${year}-${month.toString().padStart(2, '0')}`;
    
    const expectWithPO = (i + 2 > MAX_FORECAST - 1) ? selectedItem.expectedWithPO[MAX_FORECAST - 1] : selectedItem.expectedWithPO[i + 2];
    const flagOrder   = (expectWithPO < 0) ? true : false;
    const flagReceipt = (selectedItem.expectedTotal[i] < 0) ? true : false;
    // const flagOrder   = (item.neededActions[i].includes("발주")) ? true : false;
    // const flagReceipt = (item.neededActions[i].includes("입고")) ? true : false;
    const actions = (flagOrder && flagReceipt) ? "발주 및 입고"
      : (flagOrder) ? "발주 필요" : (flagReceipt) ? "입고 필요" : "정상";
    
    rows.push(
      <TableRow key={date}>
        <TableCell>{date}</TableCell>
        <TableCell>{selectedItem.monthlyUsage[i]}개</TableCell>
        <TableCell>{selectedItem.monthlyExpiry[i]}개</TableCell>
        <TableCell>{selectedItem.monthlyReceipt[i]}개</TableCell>
        <TableCell>{selectedItem.expectedTotal[i]}개</TableCell>
        <TableCell>{selectedItem.expectedWithPO[i]}개</TableCell>
        <TableCell>
          <Badge className={getActionsColor(actions)}>{actions}</Badge>
        </TableCell>
      </TableRow>
    );
    points.push({
      month: date,
      stock: selectedItem.expectedWithPO[i],
    });
  }
  
  const chartData = useMemo(() => {
    return points;
  }, [selectedItem, currMonth, currYear]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>부품 상세 정보: {selectedItem.partNo}</DialogTitle>
          <DialogDescription>
            백업 부품: {selectedItem.backupPartNos.length > 0 ? selectedItem.backupPartNos.join(", ") : "없음"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 기본 정보 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">현재고 F</p>
              <p className="text-2xl font-bold">{selectedItem.currentStock.toLocaleString()}개</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">총재고 Q</p>
              <p className="text-2xl font-bold">{selectedItem.totalStock.toLocaleString()}개</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Open PO</p>
              <p className="text-2xl font-bold">{selectedItem.openPO.toLocaleString()}개</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">당월 소진량</p>
              <p className="text-2xl font-bold">{(selectedItem.monthlyUsage[0] + selectedItem.monthlyExpiry[0]).toLocaleString()}개</p>
            </div>
          </div>

          {/* 월별 예상 사용량 테이블 */}
          <ScrollArea className="flex-1 p-4">
            <h3 className="text-lg font-semibold mb-3">월별 예상 사용량 및 재고 변화</h3>
            <div className="max-h-96 overflow-y-auto overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>월</TableHead>
                    <TableHead>예상 사용량</TableHead>
                    <TableHead>유효기간 만료</TableHead>
                    <TableHead>입고 예정</TableHead>
                    <TableHead>예상 재고</TableHead>
                    <TableHead>PO 포함</TableHead>
                    <TableHead>재고 상태</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>{rows}</TableBody>
              </Table>
            </div>
          </ScrollArea>

          {/* 차트 영역 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">재고 및 사용량 추이</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <ReferenceLine
                  y={0}
                  strokeWidth={2}
                  strokeDasharray="0"
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="stock"
                  stroke="#7066A8"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
