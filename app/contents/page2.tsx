// "use-client"

// import { useState } from "react"
import { mutate } from "swr";
import {
  Package, PackagePlus, PackageMinus, PackageX, ClipboardList, AlertTriangle,
  ChevronDown, Search, ListFilter, ArrowUp, ArrowDown, Minus,
} from "lucide-react"

// import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// import ForecastDialog from "../components/forecast-dialog"

// ------------------------------
// 0. CONSTANTS & UTILITIES
// ------------------------------

const inventoryStatus = [
  {
    inventoryNo: "PM0062-05-001",
    type: "보류 재고",
    quantity: 3,
    unit: " EA",
    storageBin: "2A20-05-35-02",
    batch: "0000066303",
    receiptDate: "2024-12-05",
    expiryDate: "2025-02-28",
    inboundBlocked: true,
    outboundBlocked: false
  },
  {
    inventoryNo: "PM0164-01-001",
    type: "보류 재고",
    quantity: 1,
    unit: " EA",
    storageBin: "2A20-20-05-04",
    batch: "0000065115",
    receiptDate: "2024-11-07",
    expiryDate: "2025-02-28",
    inboundBlocked: false,
    outboundBlocked: false
  },
  {
    inventoryNo: "PM0009-01-002",
    type: "가용 재고",
    quantity: 5,
    unit: " EA",
    storageBin: "1A00-26-02-03",
    batch: "0000045326",
    receiptDate: "2023-04-06",
    expiryDate: "2025-03-31",
    inboundBlocked: false,
    outboundBlocked: false
  },
  {
    inventoryNo: "PM0009-01-003",
    type: "보류 재고",
    quantity: 1,
    unit: " EA",
    storageBin: "2A10-01-33-01",
    batch: "0000053143",
    receiptDate: "2025-01-16",
    expiryDate: "2025-03-31",
    inboundBlocked: true,
    outboundBlocked: true
  },
  {
    inventoryNo: "PM0061-01-003",
    type: "가용 재고",
    quantity: 1,
    unit: " EA",
    storageBin: "2A20-15-33-05",
    batch: "0000061471",
    receiptDate: "2025-03-24",
    expiryDate: "2025-03-31",
    inboundBlocked: false,
    outboundBlocked: false
  },
  {
    inventoryNo: "PM0061-01-003",
    type: "보류 재고",
    quantity: 1,
    unit: " EA",
    storageBin: "2A20-16-21-02",
    batch: "0000055886",
    receiptDate: "2025-01-21",
    expiryDate: "2025-03-31",
    inboundBlocked: false,
    outboundBlocked: true
  },
  {
    inventoryNo: "PM0061-01-003",
    type: "보류 재고",
    quantity: 1,
    unit: " EA",
    storageBin: "2A20-17-16-03",
    batch: "0000056545",
    receiptDate: "2025-02-26",
    expiryDate: "2025-03-31",
    inboundBlocked: false,
    outboundBlocked: true
  },
  {
    inventoryNo: "PM0233-24-001",
    type: "가용 재고",
    quantity: 1,
    unit: " EA",
    storageBin: "2A20-18-14-03",
    batch: "0000045809",
    receiptDate: "2023-04-13",
    expiryDate: "2025-04-30",
    inboundBlocked: false,
    outboundBlocked: false
  },
  {
    inventoryNo: "PM0009-01-001",
    type: "가용 재고",
    quantity: 1,
    unit: " EA",
    storageBin: "TRANSFER FOR WD1",
    batch: "0000062894",
    receiptDate: "2024-09-12",
    expiryDate: "2025-04-30",
    inboundBlocked: false,
    outboundBlocked: false
  },
  {
    inventoryNo: "PM0181-05-001",
    type: "가용 재고",
    quantity: 4,
    unit: " EA",
    storageBin: "2A20-09-37-03",
    batch: "0000048407",
    receiptDate: "2023-11-24",
    expiryDate: "2025-05-01",
    inboundBlocked: false,
    outboundBlocked: true
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

export default function Page2({ kpi, forecast, lastUpdate }: PageProps) {
  // const [searchTerm, setSearchTerm] = useState("")
  // const [selectedItem, setSelectedItem] = useState(null)
  // const [isInfoOpen, setisInfoOpen] = useState(false)

  const refreshKpi = () => mutate("/dashboard/api/data-kpi");
  const refreshForecast = () => mutate("/dashboard/api/data-forecast");

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
                label: "전체 가용 재고",
                icon: Package,
                data: kpi.data.kpi.stock,
                change: kpi.data.kpi.stockChange,
                unit: " EA",
              },
              {
                label: "보류 재고",
                icon: PackagePlus,
                data: Math.trunc(kpi.data.kpi.stock * 0.4),
                change: Math.trunc(kpi.data.kpi.stockChange * 0.4),
                unit: " EA",
              },
              {
                label: "만료 임박 재고",
                icon: PackageMinus,
                data: Math.trunc(kpi.data.kpi.stock * 0.011),
                change: Math.trunc(kpi.data.kpi.stockChange * -0.01),
                unit: " EA",
              },
              {
                label: "만료 초과 재고",
                icon: PackageX,
                data: Math.trunc(kpi.data.kpi.stock * 0.02),
                change: Math.trunc(kpi.data.kpi.stockChange * 0.01),
                unit: " EA",
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
      </>

      {/* 메인 콘텐츠 탭 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>재고 현황 조회</CardTitle>
              <CardDescription>재고별 수량·상태, 저장 위치, 입고일, 만료일 등 파악</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm italic text-gray-500 mr-2">
                마지막 업데이트 : {lastUpdate[0]}, {lastUpdate[1]}
              </div>
              {/* <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="재고 번호 검색..."
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
                  <DropdownMenuItem>전체</DropdownMenuItem>
                  <DropdownMenuItem>가용 재고</DropdownMenuItem>
                  <DropdownMenuItem>보류 재고</DropdownMenuItem>
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
                    <TableHead className="text-center">재고 번호</TableHead>
                    <TableHead className="text-center shaded">유형</TableHead>
                    <TableHead className="text-center">수량</TableHead>
                    <TableHead className="text-center">저장 빈</TableHead>
                    <TableHead className="text-center">배치</TableHead>
                    <TableHead className="text-center shaded">입고일</TableHead>
                    <TableHead className="text-center shaded">만료일</TableHead>
                    <TableHead className="text-center">반입 보류</TableHead>
                    <TableHead className="text-center">반출 보류</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {inventoryStatus.map((item, index) => {
                    return (
                      <TableRow key={index} className="cursor-pointer hover:bg-gray-50"
                        // onClick={() => {
                        //   setSelectedItem(item)
                        //   setisInfoOpen(true)
                        // }}
                      >
                        <TableCell className="text-center">{item.inventoryNo}</TableCell>
                        <TableCell className="text-center shaded">{item.type}</TableCell>
                        <TableCell className="text-center">{item.quantity}{item.unit}</TableCell>
                        <TableCell className="text-center">{item.storageBin}</TableCell>
                        <TableCell className="text-center">{item.batch}</TableCell>
                        <TableCell className="text-center shaded">{item.receiptDate}</TableCell>
                        <TableCell className="text-center shaded">{item.expiryDate}</TableCell>
                        <TableCell className="text-center">{item.inboundBlocked ? "" : "X"}</TableCell>
                        <TableCell className="text-center">{item.outboundBlocked ? "" : "X"}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 부품 상세 정보 모달 */}
      {/* <ForecastDialog isOpen={isInfoOpen} onClose={() => setisInfoOpen(false)} selectedItem={selectedItem} /> */}
    </>
  )
}