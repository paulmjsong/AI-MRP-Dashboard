// "use-client"

// import { useState } from "react"
import { mutate } from "swr";
import { format, differenceInCalendarDays, addDays, isBefore, parseISO } from 'date-fns'
import {
  Package, ClipboardList, CircleCheckBig, Clock, ClockAlert, AlertTriangle,
  ChevronDown, Search, ListFilter, ArrowUp, ArrowDown, Minus,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// import ForecastDialog from "../components/forecast-dialog"
// import POGanttChart from "../components/po-gantt-chart"

// ------------------------------
// 0. CONSTANTS & UTILITIES
// ------------------------------

const openPOs = [
  {
    "poNumber": "4500060679",
    "itemCode": "RM3050-02-001",
    "requester": "최지수",
    "supplier": "글로벌라이프사이언스솔루션즈코리아 유한회사",
    "orderDate": "2024-12-06",
    "expectedDate": "2025-01-25",
    "orderQty": 6,
    "receivedQty": 0,
    "remainingQty": 6,
    "unit": " PAK",
    "plant": "1200"
  },
  {
    "poNumber": "4500060707",
    "itemCode": "RM3449-10-001",
    "requester": "윤지윤",
    "supplier": "싸토리우스코리아바이오텍 유한회사",
    "orderDate": "2024-12-09",
    "expectedDate": "2024-12-09",
    "orderQty": 6,
    "receivedQty": 0,
    "remainingQty": 6,
    "unit": " PAK",
    "plant": "1200"
  },
  {
    "poNumber": "4500060771",
    "itemCode": "RM3235-13-001",
    "requester": "최지수",
    "supplier": "싸토리우스코리아바이오텍 유한회사",
    "orderDate": "2024-12-12",
    "expectedDate": "2025-01-20",
    "orderQty": 4,
    "receivedQty": 0,
    "remainingQty": 4,
    "unit": " EA",
    "plant": "1200"
  },
  {
    "poNumber": "4500060771",
    "itemCode": "RM3376-24-001",
    "requester": "최지수",
    "supplier": "싸토리우스코리아바이오텍 유한회사",
    "orderDate": "2024-12-12",
    "expectedDate": "2025-02-01",
    "orderQty": 97,
    "receivedQty": 0,
    "remainingQty": 97,
    "unit": " PAK",
    "plant": "1200"
  },
  {
    "poNumber": "4500060772",
    "itemCode": "RM3373-24-001",
    "requester": "최지수",
    "supplier": "머크주식회사",
    "orderDate": "2024-12-12",
    "expectedDate": "2025-07-01",
    "orderQty": 10,
    "receivedQty": 0,
    "remainingQty": 10,
    "unit": " PAK",
    "plant": "1200"
  },
  {
    "poNumber": "4500060772",
    "itemCode": "RM3362-24-001",
    "requester": "최지수",
    "supplier": "머크주식회사",
    "orderDate": "2024-12-12",
    "expectedDate": "2025-03-10",
    "orderQty": 22,
    "receivedQty": 2,
    "remainingQty": 20,
    "unit": " PAK",
    "plant": "1200"
  },
  {
    "poNumber": "4500060787",
    "itemCode": "PM0009-01-002",
    "requester": "윤지윤",
    "supplier": "싸토리우스코리아바이오텍 유한회사",
    "orderDate": "2024-12-12",
    "expectedDate": "2025-01-02",
    "orderQty": 7,
    "receivedQty": 0,
    "remainingQty": 7,
    "unit": " PAK",
    "plant": "1200"
  },
  {
    "poNumber": "4500061026",
    "itemCode": "PM0207-01-001",
    "requester": "윤지윤",
    "supplier": "싸토리우스코리아바이오텍 유한회사",
    "orderDate": "2024-12-12",
    "expectedDate": "2025-09-01",
    "orderQty": 27,
    "receivedQty": 0,
    "remainingQty": 27,
    "unit": " PAK",
    "plant": "1100"
  },
  {
    "poNumber": "4500061026",
    "itemCode": "PM0138-01-009",
    "requester": "윤지윤",
    "supplier": "싸토리우스코리아바이오텍 유한회사",
    "orderDate": "2024-12-12",
    "expectedDate": "2025-06-23",
    "orderQty": 88,
    "receivedQty": 0,
    "remainingQty": 88,
    "unit": " PAK",
    "plant": "1100"
  },
  {
    "poNumber": "4500061026",
    "itemCode": "PM0138-01-008",
    "requester": "윤지윤",
    "supplier": "싸토리우스코리아바이오텍 유한회사",
    "orderDate": "2024-12-12",
    "expectedDate": "2025-03-17",
    "orderQty": 106,
    "receivedQty": 0,
    "remainingQty": 106,
    "unit": " PAK",
    "plant": "1100"
  }
];

// function getActionsColor(actions: string) {
//   if (actions.includes("발주")) return "bg-red-100 text-red-800";
//   if (actions.includes("입고")) return "bg-yellow-100 text-yellow-800";
//   return "bg-green-100 text-green-800";
// }

// ------------------------------
// 1. MAIN
// ------------------------------

interface PageProps {
  kpi: any;
  forecast: any;
  lastUpdate: any;
}

export default function Page1({ kpi, forecast, lastUpdate }: PageProps) {
  // const [searchTerm, setSearchTerm] = useState("")
  // const [selectedItem, setSelectedItem] = useState(null)
  // const [isInfoOpen, setisInfoOpen] = useState(false)

  const refreshKpi = () => mutate("/dashboard/api/data-kpi");
  const refreshForecast = () => mutate("/dashboard/api/data-forecast");

  const minDate = openPOs.reduce(
    (min, po) => (isBefore(parseISO(po.orderDate), min) ? parseISO(po.orderDate) : min),
    parseISO(openPOs[0].orderDate)
  )
  const maxDate = openPOs.reduce(
    (max, po) => (parseISO(po.expectedDate) > max ? parseISO(po.expectedDate) : max),
    parseISO(openPOs[0].expectedDate)
  )

  return (
    <>
      <div className="grid grid-cols-[1fr,3fr] gap-6">
        
        {/* KPI 카드 */}
        { kpi.isLoading ? (
          <Card className="flex flex-col items-center justify-center">
            <p>로딩 중…</p>
          </Card>
        ) : kpi.error ? (
          <Card className="flex flex-col items-center justify-center">
            <p>문제가 발생했습니다.</p>
            <Button onClick={refreshKpi}>다시 불러오기</Button>
          </Card>
        ) : !kpi.data.kpi ? (
          <Card className="flex flex-col items-center justify-center">
            <p>아직 업로드된 파일이 없습니다.</p>
            <Button onClick={refreshKpi}>다시 불러오기</Button>
          </Card>
        ) : (
          (() => {
            const kpiContents = [
              {
                label: "전체 Open PO 건수",
                icon: ClipboardList,
                data: 410,
                change: 0,
                unit: "건",
              },
              {
                label: "입고 수량",
                icon: CircleCheckBig,
                data: kpi.data.kpi.openPO,
                change: kpi.data.kpi.openPOChange,
                unit: " EA",
              },
              {
                label: "미입고 수량",
                icon: Clock,
                data: Math.trunc(kpi.data.kpi.openPO * 2),
                change: Math.trunc(kpi.data.kpi.openPOChange * 2),
                unit: " EA",
              },
              {
                label: "입고 지연 수량",
                icon: ClockAlert,
                data: Math.trunc(kpi.data.kpi.openPO * 1.5),
                change: Math.trunc(kpi.data.kpi.openPOChange * 1.5),
                unit: "건",
              },
            ];
            return (
              <div className="grid grid-cols-1 gap-6">
                { kpiContents.map((kpiContent, i) => (
                  <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">{kpiContent.label}</CardTitle>
                      <kpiContent.icon className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">{kpiContent.data}{kpiContent.unit}</div>
                      { kpiContent.change > 0 ? (
                        <div className="flex items-center mt-1">
                          <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                          <span className={"text-sm text-green-600"}>{kpiContent.change}{kpiContent.unit}</span>
                        </div>
                      ) : kpiContent.change < 0 ? (
                        <div className="flex items-center mt-1">
                          <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                          <span className={"text-sm text-red-600"}>{kpiContent.change}{kpiContent.unit}</span>
                        </div>
                      ) : (
                        <div className="flex items-center mt-1">
                          <Minus className="h-4 w-4 text-gray-500 mr-1" />
                          <span className={"text-sm text-gray-600"}>{kpiContent.change}{kpiContent.unit}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            );
          })()
        )}

        {/* 메인 콘텐츠 */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Open PO</CardTitle>
                <CardDescription>미입고된 발주서 정보 표시</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm italic text-gray-600 mr-2">
                  마지막 업데이트 : {lastUpdate[0]}, {lastUpdate[1]}
                </div>
                {/* <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="PO 번호 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div> */}
              </div>
            </div>
          </CardHeader>
          <CardContent className="overflow-y-auto">
            { forecast.isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <p>로딩 중…</p>
              </div>
            ) : forecast.error ? (
              <div className="flex flex-col items-center justify-center py-20">
                <p>문제가 발생했습니다.</p>
                <Button onClick={refreshForecast}>다시 불러오기</Button>
              </div>
            ) : !forecast.data.filter ? (
              <div className="flex flex-col items-center justify-center py-20">
                <p>아직 업로드된 파일이 없습니다.</p>
                <Button onClick={refreshForecast}>다시 불러오기</Button>
              </div>
            ) : (
              <ScrollArea className="flex-1">
                <div className="max-h-[490px] overflow-y-auto overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-center">PO 번호</TableHead>
                        <TableHead className="text-center">품목</TableHead>
                        <TableHead className="text-center">발주 요청일</TableHead>
                        <TableHead className="text-center">입고 예정일</TableHead>
                        <TableHead className="text-center">발주 수량</TableHead>
                        <TableHead className="text-center shaded">입고 수량</TableHead>
                        <TableHead className="text-center shaded">미납 수량</TableHead>
                        <TableHead className="text-center">요청자</TableHead>
                        {/* <TableHead>거래처</TableHead> */}
                        {/* <TableHead>플랜트</TableHead> */}
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {openPOs.map((po, index) => {
                        return (
                          <TableRow key={index} className="cursor-pointer hover:bg-gray-50"
                            // onClick={() => {
                            //   setSelectedItem(item)
                            //   setisInfoOpen(true)
                            // }}
                          >
                            <TableCell className="text-center">{po.poNumber}</TableCell>
                            <TableCell className="text-center">{po.itemCode}</TableCell>
                            <TableCell className="text-center">{po.orderDate}</TableCell>
                            <TableCell className="text-center">{po.expectedDate}</TableCell>
                            <TableCell className="text-center">{po.orderQty}{po.unit}</TableCell>
                            <TableCell className="text-center shaded">{po.receivedQty}{po.unit}</TableCell>
                            <TableCell className="text-center shaded">{po.remainingQty}{po.unit}</TableCell>
                            <TableCell className="text-center">{po.requester}</TableCell>
                            {/* <TableCell>{po.supplier}</TableCell> */}
                            {/* <TableCell>{po.plant}</TableCell> */}
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 타임라인 */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Open PO 타임라인</CardTitle>
          <CardDescription>Timeline: {format(minDate, 'yyyy-MM-dd')} to {format(maxDate, 'yyyy-MM-dd')}</CardDescription>
        </CardHeader>
        <CardContent>
          { forecast.isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p>로딩 중…</p>
            </div>
          ) : forecast.error ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p>문제가 발생했습니다.</p>
              <Button onClick={refreshForecast}>다시 불러오기</Button>
            </div>
          ) : !forecast.data.filter ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p>아직 업로드된 파일이 없습니다.</p>
              <Button onClick={refreshForecast}>다시 불러오기</Button>
            </div>
          ) : (
            <POGanttChart data={openPOs} minDate={minDate} maxDate={maxDate} />
          )}
        </CardContent>
      </Card> */}
    </>
  )
}