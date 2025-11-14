// "use-client"

// import { useState } from "react"
import { mutate } from "swr";
import {
  Package, CalendarCheck, Filter, FlaskConical, OctagonAlert,
  ChevronDown, Search, ListFilter, ArrowUp, ArrowDown, Minus,
} from "lucide-react"

// import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// import ForecastDialog from "../components/forecast-dialog"

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

  const currDate  = new Date();
  // const currYear  = currDate.getUTCFullYear();  // full year in UTC (2025 = 2025)
  const currMonth = currDate.getMonth();        // zero-based index (0 = January)

  return (
    <>
      {/* KPI 카드 */}
      <>
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
                label: "일정 준수율",
                icon: CalendarCheck,
                data: kpi.data.kpi.stock * 0.035,
                change: kpi.data.kpi.stockChange * 0.0035,
                unit: "%",
              },
              {
                label: "배양 수율",
                icon: FlaskConical,
                data: kpi.data.kpi.openPO * 0.035,
                change: kpi.data.kpi.openPOChange * 0.0035,
                unit: "%",
              },
              {
                label: "정제 수율",
                icon: Filter,
                data: kpi.data.kpi.reqReceipt * 4.035,
                change: kpi.data.kpi.stockChange * 0.0035,
                unit: "%",
              },
              {
                label: "최종 제품 결함률",
                icon: OctagonAlert,
                data: kpi.data.kpi.reqOrders * 0.35,
                change: kpi.data.kpi.openPOChange * -0.0035,
                unit: "%",
              },
            ];
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                { kpiContents.map((kpiContent, i) => (
                  <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">{kpiContent.label}</CardTitle>
                      <kpiContent.icon className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">{kpiContent.data.toFixed(2)}{kpiContent.unit}</div>
                      { kpiContent.change > 0 ? (
                        <div className="flex items-center mt-1">
                          <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                          <span className={"text-sm text-green-600"}>{kpiContent.change.toFixed(2)}{kpiContent.unit}</span>
                        </div>
                      ) : kpiContent.change < 0 ? (
                        <div className="flex items-center mt-1">
                          <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                          <span className={"text-sm text-red-600"}>{kpiContent.change.toFixed(2)}{kpiContent.unit}</span>
                        </div>
                      ) : (
                        <div className="flex items-center mt-1">
                          <Minus className="h-4 w-4 text-gray-500 mr-1" />
                          <span className={"text-sm text-gray-600"}>{kpiContent.change.toFixed(2)}{kpiContent.unit}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            );
          })()
        )}
      </>

      {/* 메인 콘텐츠 탭 */}
      <Tabs defaultValue="plan1" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="plan1">배양 단계</TabsTrigger>
          <TabsTrigger value="plan2">정제 단계</TabsTrigger>
          <TabsTrigger value="plan3">최종 제품 단계</TabsTrigger>
        </TabsList>

        {/* 배양 탭 */}
        <TabsContent value="plan1" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>배양 단계</CardTitle>
                  <CardDescription>12,500, 15,000L 기준</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                <div className="text-sm italic text-gray-600 mr-2">
                  마지막 업데이트 : {lastUpdate[0]}, {lastUpdate[1]}
                </div>
                  {/* <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="프로젝트 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div> */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <ListFilter className="h-4 w-4 mr-2" />
                        필터
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>P1</DropdownMenuItem>
                      <DropdownMenuItem>P2</DropdownMenuItem>
                      <DropdownMenuItem>P3</DropdownMenuItem>
                      <DropdownMenuItem>SUP</DropdownMenuItem>
                      <DropdownMenuItem>PBL</DropdownMenuItem>
                      <DropdownMenuItem>BNX</DropdownMenuItem>
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
                        <TableHead className="text-center">구분</TableHead>
                        <TableHead className="text-center">프로젝트</TableHead>
                        <TableHead className="text-center shaded">{currMonth + 1}월</TableHead>
                        {[...Array(11)].map((_, i) => {
                          const month = (currMonth + 1 + i) % 12 + 1;
                          return (<TableHead className="text-center" key={month}>{month}월</TableHead>)
                        })}
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {forecast.data.filter.map((item, index) => {
                        return (
                          <TableRow key={index} className="cursor-pointer hover:bg-gray-50"
                            // onClick={() => {
                            //   setSelectedItem(item)
                            //   setisInfoOpen(true)
                            // }}
                          >
                            <TableCell className="text-center">P1</TableCell>
                            <TableCell className="text-center">{item.partNo}</TableCell>
                            <TableCell className="text-center shaded">{item.monthlyUsage[0]}</TableCell>
                            {[...Array(11)].map((_, i) => {
                              return (<TableCell className="text-center" key={i}>{(item.monthlyUsage[i+1]).toLocaleString()}</TableCell>)
                            })}
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

        {/* 정제 탭 */}
        <TabsContent value="plan2" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>정제 단계</CardTitle>
                  <CardDescription>Initial Purification 기준</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {/* <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="프로젝트 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div> */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <ListFilter className="h-4 w-4 mr-2" />
                        필터
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>P1</DropdownMenuItem>
                      <DropdownMenuItem>P2</DropdownMenuItem>
                      <DropdownMenuItem>P3</DropdownMenuItem>
                      <DropdownMenuItem>SUP</DropdownMenuItem>
                      <DropdownMenuItem>PBL</DropdownMenuItem>
                      <DropdownMenuItem>BNX</DropdownMenuItem>
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
                        <TableHead className="text-center">구분</TableHead>
                        <TableHead className="text-center">프로젝트</TableHead>
                        <TableHead className="text-center shaded">{currMonth + 1}월</TableHead>
                        {[...Array(11)].map((_, i) => {
                          const month = (currMonth + 1 + i) % 12 + 1;
                          return (<TableHead className="text-center" key={month}>{month}월</TableHead>)
                        })}
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {forecast.data.filter.map((item, index) => {
                        return (
                          <TableRow key={index} className="cursor-pointer hover:bg-gray-50"
                            // onClick={() => {
                            //   setSelectedItem(item)
                            //   setisInfoOpen(true)
                            // }}
                          >
                            <TableCell className="text-center">P1</TableCell>
                            <TableCell className="text-center">{item.partNo}</TableCell>
                            <TableCell className="text-center shaded">{item.monthlyUsage[0]}</TableCell>
                            {[...Array(11)].map((_, i) => {
                              return (<TableCell className="text-center">{(item.monthlyUsage[i+1]).toLocaleString()}</TableCell>)
                            })}
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

        {/* 최종 제품 탭 */}
        <TabsContent value="plan3" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>최종 제품 단계</CardTitle>
                  <CardDescription>DP 기준</CardDescription>
                </div>
                {/* <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="프로젝트 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div> */}
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
                        <TableHead className="text-center">구분</TableHead>
                        <TableHead className="text-center">프로젝트</TableHead>
                        <TableHead className="text-center shaded">{currMonth + 1}월</TableHead>
                        {[...Array(11)].map((_, i) => {
                          const month = (currMonth + 1 + i) % 12 + 1;
                          return (<TableHead className="text-center" key={month}>{month}월</TableHead>)
                        })}
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {forecast.data.filter.map((item, index) => {
                        return (
                          <TableRow key={index} className="cursor-pointer hover:bg-gray-50"
                            // onClick={() => {
                            //   setSelectedItem(item)
                            //   setisInfoOpen(true)
                            // }}
                          >
                            <TableCell className="text-center">DP</TableCell>
                            <TableCell className="text-center">{item.partNo}</TableCell>
                            <TableCell className="text-center shaded">{item.monthlyUsage[0]}</TableCell>
                            {[...Array(11)].map((_, i) => {
                              return (<TableCell className="text-center">{(item.monthlyUsage[i+1]).toLocaleString()}</TableCell>)
                            })}
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
      {/* <ForecastDialog isOpen={isInfoOpen} onClose={() => setisInfoOpen(false)} selectedItem={selectedItem} /> */}
    </>
  )
}