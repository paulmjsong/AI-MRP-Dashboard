"use-client"

import { useState } from "react"
import { mutate } from "swr";
import {
  Package, Factory, Calendar, AlertTriangle,
  ChevronDown, Search, Filter,
  ArrowUp, ArrowDown, Minus,
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

interface HomePageProps {
  kpi: any;
  forecast: any;
}

export default function HomePage({ kpi, forecast }: HomePageProps) {
  // const [searchTerm, setSearchTerm] = useState("")
  const [selectedItem, setSelectedItem] = useState(null)
  const [isInfoOpen, setisInfoOpen] = useState(false)

  const refreshKpi = () => mutate("/dashboard/api/data-kpi");
  const refreshForecast = () => mutate("/dashboard/api/data-forecast");

  return (
    <>
      {/* KPI 카드 */}
      <>
        { kpi.isLoading ? (
          <Card className="flex items-center justify-center">
            <p>로딩 중…</p>
          </Card>
        ) : kpi.error ? (
          <Card className="flex items-center justify-center">
            <p>문제가 발생했습니다.</p>
            <Button onClick={refreshKpi}>다시 불러오기</Button>
          </Card>
        ) : !kpi.data.kpi ? (
          <Card className="flex items-center justify-center">
            <p>아직 업로드된 파일이 없습니다.</p>
            <Button onClick={refreshKpi}>다시 불러오기</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card key={0}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">총 부품 수</CardTitle>
                <Package className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{kpi.data.kpi.stock}개</div>
                {kpi.data.kpi.stockChange > 0 ? (
                  <div className="flex items-center mt-1">
                    <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className={"text-sm text-green-600"}>{kpi.data.kpi.stockChange}개</span>
                  </div>
                ) : kpi.data.kpi.stockChange < 0 ? (
                  <div className="flex items-center mt-1">
                    <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                    <span className={"text-sm text-red-600"}>{kpi.data.kpi.stockChange}개</span>
                  </div>
                ) : (
                  <div className="flex items-center mt-1">
                    <Minus className="h-4 w-4 text-gray-500 mr-1" />
                    <span className={"text-sm text-gray-600"}>{kpi.data.kpi.stockChange}개</span>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card key={1}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">전체 Open PO 수량</CardTitle>
                <Factory className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{kpi.data.kpi.openPO}개</div>
                {kpi.data.kpi.openPOChange > 0 ? (
                  <div className="flex items-center mt-1">
                    <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className={"text-sm text-green-600"}>{kpi.data.kpi.openPOChange}개</span>
                  </div>
                ) : kpi.data.kpi.openPOChange < 0 ? (
                  <div className="flex items-center mt-1">
                    <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                    <span className={"text-sm text-red-600"}>{kpi.data.kpi.openPOChange}개</span>
                  </div>
                ) : (
                  <div className="flex items-center mt-1">
                    <Minus className="h-4 w-4 text-gray-500 mr-1" />
                    <span className={"text-sm text-gray-600"}>{kpi.data.kpi.openPOChange}개</span>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card key={2}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">당월 입고 요청 필요 수량</CardTitle>
                <Calendar className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{kpi.data.kpi.reqReceipt}개</div>
                {kpi.data.kpi.reqReceiptChange > 0 ? (
                  <div className="flex items-center mt-1">
                    <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className={"text-sm text-green-600"}>{kpi.data.kpi.reqReceiptChange}개</span>
                  </div>
                ) : kpi.data.kpi.reqReceiptChange < 0 ? (
                  <div className="flex items-center mt-1">
                    <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                    <span className={"text-sm text-red-600"}>{kpi.data.kpi.reqReceiptChange}개</span>
                  </div>
                ) : (
                  <div className="flex items-center mt-1">
                    <Minus className="h-4 w-4 text-gray-500 mr-1" />
                    <span className={"text-sm text-gray-600"}>{kpi.data.kpi.reqReceiptChange}개</span>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card key={3}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">당월 발주 요청 필요 수량</CardTitle>
                <AlertTriangle className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{kpi.data.kpi.reqOrders}개</div>
                {kpi.data.kpi.reqOrdersChange > 0 ? (
                  <div className="flex items-center mt-1">
                    <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className={"text-sm text-green-600"}>{kpi.data.kpi.reqOrdersChange}개</span>
                  </div>
                ) : kpi.data.kpi.reqOrdersChange < 0 ? (
                  <div className="flex items-center mt-1">
                    <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                    <span className={"text-sm text-red-600"}>{kpi.data.kpi.reqOrdersChange}개</span>
                  </div>
                ) : (
                  <div className="flex items-center mt-1">
                    <Minus className="h-4 w-4 text-gray-500 mr-1" />
                    <span className={"text-sm text-gray-600"}>{kpi.data.kpi.reqOrdersChange}개</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </>

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
                  {/* <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="부품 번호 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div> */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
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
                <div className="flex items-center justify-center py-20">
                  <p>로딩 중…</p>
                </div>
              ) : forecast.error ? (
                <div className="flex items-center justify-center py-20">
                  <p>문제가 발생했습니다.</p>
                  <Button onClick={refreshForecast}>다시 불러오기</Button>
                </div>
              ) : !forecast.data.filter ? (
                <div className="flex items-center justify-center py-20">
                  <p>아직 업로드된 파일이 없습니다.</p>
                  <Button onClick={refreshForecast}>다시 불러오기</Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>부품 번호</TableHead>
                        <TableHead className="shaded">카테고리</TableHead>
                        <TableHead>현재고 F</TableHead>
                        <TableHead>총재고 Q</TableHead>
                        <TableHead>Open PO</TableHead>
                        <TableHead>당월 소진량</TableHead>
                        <TableHead>당월 입고량</TableHead>
                        <TableHead className="shaded">예상 재고</TableHead>
                        <TableHead className="shaded">PO 포함</TableHead>
                        <TableHead>재고 상태</TableHead>
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
                            <TableCell className="font-medium">
                              <div>{item.partNo}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {item.backupPartNos.length > 0 ? `백업: ${item.backupPartNos.join(", ")}` : ""}
                              </div>
                            </TableCell>
                            <TableCell className="shaded">{item.category}</TableCell>
                            <TableCell>{item.currentStock.toLocaleString()}개</TableCell>
                            <TableCell>{item.totalStock.toLocaleString()}개</TableCell>
                            <TableCell>{item.openPO.toLocaleString()}개</TableCell>
                            <TableCell>{(item.monthlyUsage[0] + item.monthlyExpiry[0]).toLocaleString()}개</TableCell>
                            <TableCell>{item.monthlyReceipt[0].toLocaleString()}개</TableCell>
                            <TableCell className="shaded">{item.expectedTotal[0].toLocaleString()}개</TableCell>
                            <TableCell className="shaded">{item.expectedWithPO[0].toLocaleString()}개</TableCell>
                            <TableCell>
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
                  {/* <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="부품 번호 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div> */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
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
                <div className="flex items-center justify-center py-20">
                  <p>로딩 중…</p>
                </div>
              ) : forecast.error ? (
                <div className="flex items-center justify-center py-20">
                  <p>문제가 발생했습니다.</p>
                  <Button onClick={refreshForecast}>다시 불러오기</Button>
                </div>
              ) : !forecast.data.consumable ? (
                <div className="flex items-center justify-center py-20">
                  <p>아직 업로드된 파일이 없습니다.</p>
                  <Button onClick={refreshForecast}>다시 불러오기</Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>부품 번호</TableHead>
                        <TableHead className="shaded">카테고리</TableHead>
                        <TableHead>현재고 F</TableHead>
                        <TableHead>총재고 Q</TableHead>
                        <TableHead>Open PO</TableHead>
                        <TableHead>당월 소진량</TableHead>
                        <TableHead>당월 입고량</TableHead>
                        <TableHead className="shaded">예상 재고</TableHead>
                        <TableHead className="shaded">PO 포함</TableHead>
                        <TableHead>재고 상태</TableHead>
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
                            <TableCell className="font-medium">
                              <div>{item.partNo}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {item.backupPartNos.length > 0 ? `백업: ${item.backupPartNos.join(", ")}` : ""}
                              </div>
                            </TableCell>
                            <TableCell className="shaded">{item.category}</TableCell>
                            <TableCell>{item.currentStock.toLocaleString()}개</TableCell>
                            <TableCell>{item.totalStock.toLocaleString()}개</TableCell>
                            <TableCell>{item.openPO.toLocaleString()}개</TableCell>
                            <TableCell>{(item.monthlyUsage[0] + item.monthlyExpiry[0]).toLocaleString()}개</TableCell>
                            <TableCell>{item.monthlyReceipt[0].toLocaleString()}개</TableCell>
                            <TableCell className="shaded">{item.expectedTotal[0].toLocaleString()}개</TableCell>
                            <TableCell className="shaded">{item.expectedWithPO[0].toLocaleString()}개</TableCell>
                            <TableCell>
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

    {/* 부품 상세 정보 모달 */}
    <ForecastDialog isOpen={isInfoOpen} onClose={() => setisInfoOpen(false)} selectedItem={selectedItem} />
    </>
  )
}