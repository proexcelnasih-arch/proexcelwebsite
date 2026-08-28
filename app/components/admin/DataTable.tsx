"use client"

import { useState, useMemo } from "react"
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  Plus,
  Download,
  CheckSquare,
  Square,
  SlidersHorizontal,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface Column<T> {
  key: string
  header: string
  sortable?: boolean
  className?: string
  render?: (item: T) => React.ReactNode
}

export interface FilterTab {
  id: string
  label: string
  count?: number
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  searchPlaceholder?: string
  searchKeys?: (keyof T)[]
  filterTabs?: FilterTab[]
  activeTab?: string
  onTabChange?: (tabId: string) => void
  pageSize?: number
  actionButton?: {
    label: string
    href?: string
    onClick?: () => void
    icon?: React.ComponentType<{ className?: string }>
  }
  exportable?: boolean
  onExport?: () => void
  selectable?: boolean
  selectedIds?: string[]
  onSelectionChange?: (ids: string[]) => void
  getItemId?: (item: T) => string
  emptyMessage?: string
  emptySubtext?: string
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchPlaceholder = "Rechercher…",
  searchKeys = [],
  filterTabs,
  activeTab,
  onTabChange,
  pageSize = 10,
  actionButton,
  exportable = false,
  onExport,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  getItemId = (item) => item.id,
  emptyMessage = "Aucun enregistrement trouvé",
  emptySubtext = "Essayez de modifier vos filtres ou termes de recherche.",
}: DataTableProps<T>) {
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)

  // 1. Filtering
  const filteredData = useMemo(() => {
    if (!search.trim()) return data
    const q = search.toLowerCase().trim()
    return data.filter((item) => {
      if (searchKeys.length > 0) {
        return searchKeys.some((key) => {
          const val = item[key]
          return val !== undefined && val !== null && String(val).toLowerCase().includes(q)
        })
      }
      return Object.values(item).some((val) =>
        val !== undefined && val !== null && String(val).toLowerCase().includes(q)
      )
    })
  }, [data, search, searchKeys])

  // 2. Sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      if (aVal === bVal) return 0
      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal
      }
      return sortDirection === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal))
    })
  }, [filteredData, sortKey, sortDirection])

  // 3. Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize))
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [sortedData, currentPage, pageSize])

  function handleSort(key: string) {
    if (sortKey === key) {
      if (sortDirection === "asc") setSortDirection("desc")
      else {
        setSortKey(null)
        setSortDirection("asc")
      }
    } else {
      setSortKey(key)
      setSortDirection("asc")
    }
  }

  function handleSelectAll() {
    if (!onSelectionChange) return
    if (selectedIds.length === paginatedData.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(paginatedData.map(getItemId))
    }
  }

  function handleSelectOne(id: string) {
    if (!onSelectionChange) return
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id))
    } else {
      onSelectionChange([...selectedIds, id])
    }
  }

  const isAllSelected =
    paginatedData.length > 0 &&
    paginatedData.every((item) => selectedIds.includes(getItemId(item)))

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xs overflow-hidden flex flex-col">
      {/* ── Top Bar with Tabs and Actions ─────────────────────── */}
      <div className="p-4 sm:p-5 border-b border-[#E2E8F0] flex flex-col gap-4">
        {/* Filter Tabs if provided */}
        {filterTabs && filterTabs.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {filterTabs.map((tab) => {
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange?.(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
                    active
                      ? "bg-[#8C1A2B] text-white shadow-xs"
                      : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
                  )}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={cn(
                        "text-[10px] px-1.5 py-0.2 rounded-full",
                        active ? "bg-white/25 text-white" : "bg-slate-200 text-slate-700"
                      )}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* Search and Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              strokeWidth={1.75}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="w-full h-9.5 pl-9.5 pr-4 rounded-xl bg-slate-50 border border-[#E2E8F0] text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#8C1A2B] focus:ring-2 focus:ring-[#8C1A2B]/10 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {exportable && (
              <button
                type="button"
                onClick={onExport}
                className="inline-flex items-center gap-1.5 h-9.5 px-3.5 rounded-xl border border-[#E2E8F0] bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
              >
                <Download className="w-3.5 h-3.5" strokeWidth={2} />
                <span>Exporter</span>
              </button>
            )}

            {actionButton && (
              actionButton.href ? (
                <a
                  href={actionButton.href}
                  className="inline-flex items-center gap-1.5 h-9.5 px-4 rounded-xl bg-[#8C1A2B] hover:bg-[#5E0F1D] text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all"
                >
                  {actionButton.icon ? (
                    <actionButton.icon className="w-3.5 h-3.5" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                  )}
                  <span>{actionButton.label}</span>
                </a>
              ) : (
                <button
                  type="button"
                  onClick={actionButton.onClick}
                  className="inline-flex items-center gap-1.5 h-9.5 px-4 rounded-xl bg-[#8C1A2B] hover:bg-[#5E0F1D] text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all"
                >
                  {actionButton.icon ? (
                    <actionButton.icon className="w-3.5 h-3.5" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                  )}
                  <span>{actionButton.label}</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* ── Data Table Area ───────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/75 border-b border-[#E2E8F0] text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {selectable && (
                <th className="p-3.5 pl-5 w-10">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-slate-400 hover:text-slate-700 transition-colors"
                    aria-label="Tout sélectionner"
                  >
                    {isAllSelected ? (
                      <CheckSquare className="w-4 h-4 text-[#8C1A2B]" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
              )}

              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "p-3.5 text-slate-600 font-bold whitespace-nowrap",
                    col.sortable && "cursor-pointer hover:text-slate-900 select-none",
                    col.className
                  )}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="inline-flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="text-slate-400">
                        {sortKey === col.key ? (
                          sortDirection === "asc" ? (
                            <ArrowUp className="w-3 h-3 text-[#8C1A2B]" />
                          ) : (
                            <ArrowDown className="w-3 h-3 text-[#8C1A2B]" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-40 hover:opacity-100" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => {
                const id = getItemId(item)
                const isSelected = selectedIds.includes(id)

                return (
                  <tr
                    key={id}
                    className={cn(
                      "hover:bg-slate-50/80 transition-colors",
                      isSelected && "bg-slate-50"
                    )}
                  >
                    {selectable && (
                      <td className="p-3.5 pl-5">
                        <button
                          type="button"
                          onClick={() => handleSelectOne(id)}
                          className="text-slate-400 hover:text-slate-700 transition-colors"
                          aria-label={`Sélectionner ligne ${id}`}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#8C1A2B]" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    )}

                    {columns.map((col) => (
                      <td key={col.key} className={cn("p-3.5", col.className)}>
                        {col.render ? col.render(item) : item[col.key]}
                      </td>
                    ))}
                  </tr>
                )
              })
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="p-12 text-center"
                >
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                      <SlidersHorizontal className="w-6 h-6" strokeWidth={1.5} />
                    </div>
                    <p className="text-sm font-bold text-slate-800 mb-1">{emptyMessage}</p>
                    <p className="text-xs text-slate-500">{emptySubtext}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination Footer ─────────────────────────────────── */}
      <div className="p-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 bg-slate-50/50">
        <div>
          Affichage de{" "}
          <span className="font-bold text-slate-800">
            {sortedData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
          </span>{" "}
          à{" "}
          <span className="font-bold text-slate-800">
            {Math.min(currentPage * pageSize, sortedData.length)}
          </span>{" "}
          sur <span className="font-bold text-slate-800">{sortedData.length}</span> résultats
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-8 h-8 rounded-lg border border-[#E2E8F0] bg-white flex items-center justify-center text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
              aria-label="Page précédente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={cn(
                  "w-8 h-8 rounded-lg text-xs font-bold transition-all",
                  currentPage === page
                    ? "bg-[#8C1A2B] text-white shadow-xs"
                    : "border border-[#E2E8F0] bg-white text-slate-700 hover:bg-slate-50"
                )}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="w-8 h-8 rounded-lg border border-[#E2E8F0] bg-white flex items-center justify-center text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
              aria-label="Page suivante"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
