"use-client"

import { useState } from "react"
import { mutate } from "swr";
import {
  Package, Factory, Truck, Calendar, ClipboardList, AlertTriangle,
  ChevronDown, Search, ListFilter, ArrowUp, ArrowDown, Minus,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import ForecastDialog from "../components/forecast-dialog"

// ------------------------------
// 0. CONSTANTS & UTILITIES
// ------------------------------

function getActionsColor(actions: string) {
  if (actions.includes("발주")) return "bg-red-100 text-red-800";
  if (actions.includes("입고")) return "bg-yellow-100 text-yellow-800";
  return "bg-green-100 text-green-800";
}

// ------------------------------
// 1. MAIN
// ------------------------------

interface PageProps {
  kpi: any;
  forecast: any;
}

export default function HomePage({ kpi, forecast }: PageProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedItem, setSelectedItem] = useState(null)
  const [isInfoOpen, setisInfoOpen] = useState(false)

  const refreshKpi = () => mutate("/dashboard/api/data-kpi");
  const refreshForecast = () => mutate("/dashboard/api/data-forecast");

  return (
    <>
      <div className="grid grid-cols-[3fr,4fr] gap-6">

        {/* 공지 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">공지</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-900">
            <div className="flex justify-between gap-6 pb-5 cursor-pointer" onClick={() => window.location.href='#'}>
              <p><span className="pr-2">[업데이트]</span>AI-MRP 자동 발주 추천 기능 개선 안내</p>
              <p className="whitespace-nowrap text-gray-600">7월 30일</p>
            </div>
            <div className="flex justify-between gap-6 pb-5 cursor-pointer" onClick={() => window.location.href='#'}>
              <p><span className="pr-2">[중요]</span>BOM 파일 형식 변경 안내 및 적용 시 유의사항</p>
              <p className="whitespace-nowrap text-gray-600">7월 28일</p>
            </div>
            <div className="flex justify-between gap-6 pb-5 cursor-pointer" onClick={() => window.location.href='#'}>
              <p><span className="pr-2">[정기점검]</span>시스템 점검으로 인한 서비스 임시 중단 안내 (7/17 01:00-05:00)</p>
              <p className="whitespace-nowrap text-gray-600">7월 28일</p>
            </div>
            <div className="flex justify-between gap-6 pb-5 cursor-pointer" onClick={() => window.location.href='#'}>
              <p><span className="pr-2">[업데이트]</span>LOT별 유효기간 자동 입력 기능 출시</p>
              <p className="whitespace-nowrap text-gray-600">7월 24일</p>
            </div>
          </CardContent>
        </Card>

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
          <Card className="space-y-2 text-center p-10">
            <p>아직 업로드된 파일이 없습니다.</p>
            <Button onClick={refreshKpi}>다시 불러오기</Button>
          </Card>
        ) : (
          (() => {
            const kpiContents = [
              {
                label: "전체 재고 수량",
                icon: Package,
                data: kpi.data.kpi.stock,
                change: kpi.data.kpi.stockChange,
                unit: " EA",
              },
              {
                label: "전체 Open PO 수량",
                icon: ClipboardList,
                data: kpi.data.kpi.openPO,
                change: kpi.data.kpi.openPOChange,
                unit: " EA",
              },
              {
                label: "당월 입고 필요 수량",
                icon: Truck,
                data: kpi.data.kpi.reqReceipt,
                change: kpi.data.kpi.reqReceiptChange,
                unit: " EA",
              },
              {
                label: "당월 추가 발주 필요 수량",
                icon: AlertTriangle,
                data: kpi.data.kpi.reqOrders,
                change: kpi.data.kpi.reqOrdersChange,
                unit: " EA",
              },
            ];
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </div>

      {/* 메인 콘텐츠 탭 */}
      <Tabs defaultValue="filterForecast" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="filterForecast">Filter Forecast</TabsTrigger>
          <TabsTrigger value="consumForecast">Consumable Forecast</TabsTrigger>
        </TabsList>

        {/* Filter Forecast 탭 */}
        <TabsContent value="filterForecast" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>Filter Forecast</CardTitle>
                  <CardDescription>예측 기반 재고 관리 및 위험도 분석</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="제품 번호 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <ListFilter className="h-4 w-4 mr-2" />
                        필터
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>전체</DropdownMenuItem>
                      <DropdownMenuItem>정상</DropdownMenuItem>
                      <DropdownMenuItem>입고 필요</DropdownMenuItem>
                      <DropdownMenuItem>발주 필요</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
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
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-center">제품 번호</TableHead>
                        <TableHead className="text-center">카테고리</TableHead>
                        <TableHead className="text-center shaded">현재고 F</TableHead>
                        <TableHead className="text-center">총재고 Q</TableHead>
                        <TableHead className="text-center">Open PO</TableHead>
                        <TableHead className="text-center">당월 소진</TableHead>
                        <TableHead className="text-center">당월 입고</TableHead>
                        <TableHead className="text-center shaded">예상 재고</TableHead>
                        <TableHead className="text-center shaded">PO 포함</TableHead>
                        <TableHead className="text-center">재고 상태</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {forecast.data.filter.map((item) => {
                        const flagOrder   = (item.expectedWithPO[2] < 0) ? true : false;
                        const flagReceipt = (item.expectedTotal[0] < 0) ? true : false;
                        // const flagOrder   = (item.neededActions[0].includes("발주")) ? true : false;
                        // const flagReceipt = (item.neededActions[0].includes("입고")) ? true : false;
                        const actions = (flagOrder && flagReceipt) ? "발주 및 입고"
                          : (flagOrder) ? "발주 필요" : (flagReceipt) ? "입고 필요" : "정상";
                        
                        return (
                          <TableRow key={item.partNo} className="cursor-pointer hover:bg-gray-50"
                            onClick={() => {
                              setSelectedItem(item)
                              setisInfoOpen(true)
                            }}
                          >
                            <TableCell className="text-center">
                              <div>{item.partNo}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {item.backupPartNos.length > 0 ? `백업: ${item.backupPartNos.join(", ")}` : ""}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">{item.category}</TableCell>
                            <TableCell className="text-center shaded">{item.currentStock.toLocaleString()} EA</TableCell>
                            <TableCell className="text-center">{item.totalStock.toLocaleString()} EA</TableCell>
                            <TableCell className="text-center">{item.openPO.toLocaleString()} EA</TableCell>
                            <TableCell className="text-center">{(item.monthlyUsage[0] + item.monthlyExpiry[0]).toLocaleString()} EA</TableCell>
                            <TableCell className="text-center">{item.monthlyReceipt[0].toLocaleString()} EA</TableCell>
                            <TableCell className="text-center shaded">{item.expectedTotal[0].toLocaleString()} EA</TableCell>
                            <TableCell className="text-center shaded">{item.expectedWithPO[0].toLocaleString()} EA</TableCell>
                            <TableCell className="text-center">
                              <Badge className={getActionsColor(actions)}>{actions}</Badge>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consumable Forecast 탭 */}
        <TabsContent value="consumForecast" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>Consumable Forecast</CardTitle>
                  <CardDescription>예측 기반 재고 관리 및 위험도 분석</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="제품 번호 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <ListFilter className="h-4 w-4 mr-2" />
                        필터
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>전체</DropdownMenuItem>
                      <DropdownMenuItem>없음</DropdownMenuItem>
                      <DropdownMenuItem>입고 필요</DropdownMenuItem>
                      <DropdownMenuItem>발주 필요</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
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
              ) : !forecast.data.consumable ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <p>아직 업로드된 파일이 없습니다.</p>
                  <Button onClick={refreshForecast}>다시 불러오기</Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-center">제품 번호</TableHead>
                        <TableHead className="text-center">카테고리</TableHead>
                        <TableHead className="text-center shaded">현재고 F</TableHead>
                        <TableHead className="text-center">총재고 Q</TableHead>
                        <TableHead className="text-center">Open PO</TableHead>
                        <TableHead className="text-center">당월 소진</TableHead>
                        <TableHead className="text-center">당월 입고</TableHead>
                        <TableHead className="text-center shaded">예상 재고</TableHead>
                        <TableHead className="text-center shaded">PO 포함</TableHead>
                        <TableHead className="text-center">재고 상태</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {forecast.data.consumable.map((item) => {
                        const flagOrder   = (item.expectedWithPO[2] < 0) ? true : false;
                        const flagReceipt = (item.expectedTotal[0] < 0) ? true : false;
                        // const flagOrder   = (item.neededActions[0].includes("발주")) ? true : false;
                        // const flagReceipt = (item.neededActions[0].includes("입고")) ? true : false;
                        const actions = (flagOrder && flagReceipt) ? "발주 및 입고"
                          : (flagOrder) ? "발주 필요" : (flagReceipt) ? "입고 필요" : "정상";
                        
                        return (
                          <TableRow key={item.partNo} className="cursor-pointer hover:bg-gray-50"
                            onClick={() => {
                              setSelectedItem(item)
                              setisInfoOpen(true)
                            }}
                          >
                            <TableCell className="text-center">
                              <div>{item.partNo}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {item.backupPartNos.length > 0 ? `백업: ${item.backupPartNos.join(", ")}` : ""}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">{item.category}</TableCell>
                            <TableCell className="text-center shaded">{item.currentStock.toLocaleString()} EA</TableCell>
                            <TableCell className="text-center">{item.totalStock.toLocaleString()} EA</TableCell>
                            <TableCell className="text-center">{item.openPO.toLocaleString()} EA</TableCell>
                            <TableCell className="text-center">{(item.monthlyUsage[0] + item.monthlyExpiry[0]).toLocaleString()} EA</TableCell>
                            <TableCell className="text-center">{item.monthlyReceipt[0].toLocaleString()} EA</TableCell>
                            <TableCell className="text-center shaded">{item.expectedTotal[0].toLocaleString()} EA</TableCell>
                            <TableCell className="text-center shaded">{item.expectedWithPO[0].toLocaleString()} EA</TableCell>
                            <TableCell className="text-center">
                              <Badge className={getActionsColor(actions)}>{actions}</Badge>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 제품 상세 정보 모달 */}
      <ForecastDialog isOpen={isInfoOpen} onClose={() => setisInfoOpen(false)} selectedItem={selectedItem} />
    </>
  )
}