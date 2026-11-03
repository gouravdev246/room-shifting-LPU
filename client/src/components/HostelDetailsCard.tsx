import { useState, useEffect, useCallback } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { roomApi, type RoomListing, type RoomFilters } from "@/lib/api"
import { RoomDetails } from "./RoomDetail"
import {
  SlidersHorizontal,
  RotateCcw,
  Loader2,
  PlusCircle,
  AlertCircle,
  Building,
  Zap,
} from "lucide-react"

const HOSTEL_OPTIONS = [
  "All Hostels",
  "BH-1",
  "BH-2",
  "BH-3",
  "BH-4",
  "BH-5",
  "GH-1",
  "GH-2",
  "GH-3",
  "GH-4",
  "Hostel 1",
  "Hostel 2",
  "Hostel 3",
]

const TYPE_OPTIONS = ["All Types", "AC", "Non-AC"]
const SEATER_OPTIONS = ["All Seaters", "1", "2", "3", "4", "5"]
const BLOCK_OPTIONS = ["All Blocks", "A", "B", "C", "D"]

const SAMPLE_FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1709805619372-40de3f158e83?q=80&w=1790&auto=format&fit=crop&ixlib=rb-4.1.0",
  "https://plus.unsplash.com/premium_photo-1716767947952-42e8fe3a28a2?w=900&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1721076748121-bbf3b6a15d09?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0",
  "https://plus.unsplash.com/premium_photo-1717014211334-8ae3b98a5965?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0",
]

export function HostelDetailsCard() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const [rooms, setRooms] = useState<RoomListing[]>([])
  const [source, setSource] = useState<string>("db")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Filters state
  const [selectedHostel, setSelectedHostel] = useState<string>(
    searchParams.get("hostel") || "All Hostels"
  )
  const [selectedType, setSelectedType] = useState<string>(
    searchParams.get("type") || "All Types"
  )
  const [selectedSeater, setSelectedSeater] = useState<string>(
    searchParams.get("seater") || "All Seaters"
  )
  const [selectedBlock, setSelectedBlock] = useState<string>(
    searchParams.get("block") || "All Blocks"
  )

  // Sync state if URL query params change
  useEffect(() => {
    const qHostel = searchParams.get("hostel")
    const qType = searchParams.get("type")
    const qSeater = searchParams.get("seater")
    const qBlock = searchParams.get("block")

    if (qHostel) setSelectedHostel(qHostel)
    if (qType) setSelectedType(qType)
    if (qSeater) setSelectedSeater(qSeater)
    if (qBlock) setSelectedBlock(qBlock)
  }, [searchParams])

  const fetchRooms = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)

    const queryFilters: RoomFilters = {}
    if (selectedHostel !== "All Hostels") queryFilters.hostel = selectedHostel
    if (selectedType !== "All Types") queryFilters.type = selectedType
    if (selectedSeater !== "All Seaters") queryFilters.seater = selectedSeater
    if (selectedBlock !== "All Blocks") queryFilters.block = selectedBlock

    try {
      const response = await roomApi.getRooms(queryFilters)
      setRooms(response.rooms || [])
      setSource(response.source || "db")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load rooms from server."
      setErrorMessage(msg)
    } finally {
      setIsLoading(false)
    }
  }, [selectedHostel, selectedType, selectedSeater, selectedBlock])

  // Trigger fetch when any filter changes
  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])

  const handleResetFilters = () => {
    setSelectedHostel("All Hostels")
    setSelectedType("All Types")
    setSelectedSeater("All Seaters")
    setSelectedBlock("All Blocks")
    setSearchParams({})
  }

  const hasActiveFilters =
    selectedHostel !== "All Hostels" ||
    selectedType !== "All Types" ||
    selectedSeater !== "All Seaters" ||
    selectedBlock !== "All Blocks"

  // Render detail view if a room is selected
  if (selectedRoomId) {
    return (
      <RoomDetails
        roomid={selectedRoomId}
        onBack={() => setSelectedRoomId(null)}
        onDeleted={() => {
          setSelectedRoomId(null)
          fetchRooms()
        }}
      />
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Filter and Control Bar */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3.5">
          <div className="flex items-center gap-2 text-foreground font-semibold text-base sm:text-lg">
            <SlidersHorizontal className="w-5 h-5 text-primary" />
            <span>Search & Filter Rooms</span>
            {source === "cache" && (
              <Badge variant="outline" className="text-[10px] gap-1 border-emerald-500/30 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30">
                <Zap className="w-3 h-3 text-emerald-500" /> Redis Cached
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="cursor-pointer text-xs gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </Button>
            )}

            <Button
              size="sm"
              onClick={() => navigate("/add-room")}
              className="cursor-pointer gap-1.5 text-xs font-medium"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List Your Room</span>
            </Button>
          </div>
        </div>

        {/* Filter dropdowns grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Hostel Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Hostel
            </label>
            <select
              value={selectedHostel}
              onChange={(e) => setSelectedHostel(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {HOSTEL_OPTIONS.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Room Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Seater Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Capacity
            </label>
            <select
              value={selectedSeater}
              onChange={(e) => setSelectedSeater(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {SEATER_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s === "All Seaters" ? s : `${s} Seater`}
                </option>
              ))}
            </select>
          </div>

          {/* Block Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Block
            </label>
            <select
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {BLOCK_OPTIONS.map((b) => (
                <option key={b} value={b}>
                  {b === "All Blocks" ? b : `Block ${b}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Header with Results Count */}
      <div className="flex items-center justify-between">
        <div className="text-left font-medium text-muted-foreground text-sm">
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading room listings...
            </span>
          ) : (
            <span>Available Rooms ({rooms.length})</span>
          )}
        </div>
      </div>

      {/* Error state alert */}
      {errorMessage && (
        <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchRooms}
            className="cursor-pointer text-xs"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Loading state skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 w-full">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card/60 p-4 space-y-3 animate-pulse"
            >
              <div className="aspect-video w-full bg-muted rounded-lg" />
              <div className="h-5 w-2/3 bg-muted rounded" />
              <div className="h-4 w-1/2 bg-muted rounded" />
              <div className="h-9 w-full bg-muted rounded-md mt-4" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !errorMessage && rooms.length === 0 && (
        <div className="text-center py-12 px-4 rounded-xl border border-dashed border-border bg-card/40 space-y-3">
          <Building className="w-12 h-12 mx-auto text-muted-foreground/60" />
          <h3 className="text-lg font-semibold text-foreground">No Rooms Found</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {hasActiveFilters
              ? "No room listings match your current filters. Try relaxing or resetting your filters."
              : "No rooms have been listed yet. Be the first to post your room for shifting!"}
          </p>
          <div className="pt-2 flex justify-center gap-3">
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={handleResetFilters} className="cursor-pointer">
                Reset Filters
              </Button>
            )}
            <Button size="sm" onClick={() => navigate("/add-room")} className="cursor-pointer gap-1.5">
              <PlusCircle className="w-4 h-4" />
              <span>List Room</span>
            </Button>
          </div>
        </div>
      )}

      {/* Room Cards Grid */}
      {!isLoading && rooms.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 w-full">
          {rooms.map((room, index) => {
            const displayPhoto =
              room.photos && room.photos.length > 0
                ? room.photos[0].image_url
                : SAMPLE_FALLBACK_IMAGES[index % SAMPLE_FALLBACK_IMAGES.length]

            return (
              <Card
                key={room.id}
                className="relative w-full pt-0 overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="relative aspect-video w-full overflow-hidden bg-muted">
                    <img
                      src={displayPhoto}
                      alt={`${room.hostel_name} Room ${room.room_number}`}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-2.5 right-2.5">
                      <Badge
                        variant="secondary"
                        className="bg-background/90 backdrop-blur-xs font-semibold shadow-xs"
                      >
                        {room.room_type}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader className="p-4 sm:p-5">
                    <CardAction>
                      <span className="text-xs font-medium text-muted-foreground">
                        Block {room.block} • Room {room.room_number}
                      </span>
                    </CardAction>
                    <CardTitle className="text-base sm:text-lg font-bold">
                      {room.hostel_name}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Type: <span className="font-medium text-foreground">{room.room_type}</span>
                    </CardDescription>
                    <CardDescription className="text-xs">
                      Capacity: <span className="font-medium text-foreground">{room.seater} Seater</span>
                    </CardDescription>
                    <CardDescription className="text-xs">
                      Resident: <span className="font-medium text-foreground">{room.resident_name || room.owner_name}</span>
                    </CardDescription>
                  </CardHeader>
                </div>

                <CardFooter className="p-4 sm:p-5 pt-0">
                  <Button
                    className="w-full cursor-pointer text-xs sm:text-sm font-medium"
                    onClick={() => setSelectedRoomId(room.id)}
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default HostelDetailsCard
