import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { roomApi, type RoomListing } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { Lock, Phone, MessageSquare, Trash2, Loader2, AlertCircle } from "lucide-react"

export interface RoomDetailData {
  roomid: string
  hostelName: string
  hostelType: "AC" | "Non-AC" | string
  image: string | string[]
  images?: string[]
  seaters: number
  blocks: string
  userName: string
  userYear?: string
  userNumber?: number | string
  roomNumber?: string
  description?: string
  canViewContact?: boolean
  isOwner?: boolean
}

interface RoomDetailsProps {
  roomid: string
  room?: RoomDetailData
  onBack?: () => void
  onDeleted?: () => void
}

const DEFAULT_FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=900&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=900&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1540518614846-7ede433c4550?w=900&auto=format&fit=crop&q=60",
]

export function RoomDetails({ roomid, room, onBack, onDeleted }: RoomDetailsProps) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

  const [liveRoom, setLiveRoom] = useState<RoomListing | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [isContactLoading, setIsContactLoading] = useState<boolean>(false)

  // Fetch live room details from backend
  useEffect(() => {
    let isMounted = true

    async function fetchDetail() {
      setIsLoading(true)
      setError(null)
      try {
        const response = await roomApi.getRoomById(roomid)
        if (isMounted && response.room) {
          setLiveRoom(response.room)
        }
      } catch (err: unknown) {
        // Fallback to pre-passed room prop if network/endpoint fails or during dev
        if (isMounted && !room) {
          const message = err instanceof Error ? err.message : "Failed to load room details."
          setError(message)
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    if (roomid) {
      fetchDetail()
    } else {
      setIsLoading(false)
    }

    return () => {
      isMounted = false
    }
  }, [roomid, room])

  useEffect(() => {
    if (!api) return

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  // Derive display values from liveRoom or fallback prop
  const hostelName = liveRoom?.hostel_name || room?.hostelName || "LPU Hostel"
  const hostelType = liveRoom?.room_type || room?.hostelType || "AC"
  const seaters = liveRoom?.seater ?? room?.seaters ?? 2
  const block = liveRoom?.block || room?.blocks || "A"
  const roomNumber = liveRoom?.room_number || room?.roomNumber || "101"
  const residentName = liveRoom?.resident_name || room?.userName || "Student"
  const ownerName = liveRoom?.owner_name || room?.userName || "LPU Resident"
  const phone = liveRoom?.owner_phone || (room?.userNumber ? String(room.userNumber) : null)
  const description = liveRoom?.description || room?.description
  const canViewContact = liveRoom ? liveRoom.can_view_contact : (isAuthenticated || room?.canViewContact)
  const isOwner = liveRoom ? liveRoom.is_owner : room?.isOwner

  // Extract images gallery
  const photosFromBackend = liveRoom?.photos && liveRoom.photos.length > 0
    ? liveRoom.photos.map((p) => p.image_url)
    : []

  const roomImages = photosFromBackend.length > 0
    ? photosFromBackend
    : room?.images && room.images.length > 0
    ? room.images
    : Array.isArray(room?.image) && room.image.length > 0
    ? room.image
    : room?.image && typeof room.image === "string"
    ? [room.image, ...DEFAULT_FALLBACK_IMAGES]
    : DEFAULT_FALLBACK_IMAGES

  // Handle WhatsApp action via /api/rooms/:id/contact or direct link
  const handleWhatsAppClick = async () => {
    if (!isAuthenticated) {
      navigate("/login")
      return
    }

    try {
      setIsContactLoading(true)
      const data = await roomApi.getRoomContact(roomid)
      if (data.contact?.whatsapp_url) {
        window.open(data.contact.whatsapp_url, "_blank")
      } else if (data.contact?.phone) {
        const cleanPhone = data.contact.phone.replace(/\D/g, "")
        window.open(`https://wa.me/91${cleanPhone}`, "_blank")
      }
    } catch {
      // Fallback to phone number if contact API fails
      if (phone) {
        const clean = phone.replace(/\D/g, "")
        window.open(`https://wa.me/91${clean}`, "_blank")
      }
    } finally {
      setIsContactLoading(false)
    }
  }

  // Handle delete listing (Owner only)
  const handleDeleteListing = async () => {
    if (!window.confirm("Are you sure you want to delete this room listing? This action cannot be undone.")) {
      return
    }

    try {
      setIsDeleting(true)
      await roomApi.deleteRoom(roomid)
      if (onDeleted) {
        onDeleted()
      } else if (onBack) {
        onBack()
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete room listing."
      alert(msg)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 sm:px-6 space-y-3">
      {onBack && (
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="cursor-pointer gap-1.5 text-xs font-medium"
        >
          ← Back to All Rooms
        </Button>
      )}

      {error && !liveRoom && !room && (
        <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoading && !liveRoom && !room ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading room details...</p>
        </Card>
      ) : (
        <Card className="overflow-hidden shadow-lg border border-border p-0 gap-0">
        <div className="grid grid-cols-1 md:grid-cols-2 items-stretch">
          {/* Left: Image Carousel */}
          <div className="relative w-full h-[280px] sm:h-[340px] md:h-full min-h-[280px] md:min-h-[380px] bg-muted overflow-hidden">
            <Carousel setApi={setApi} className="w-full h-full">
              <CarouselContent className="h-full ml-0">
                {roomImages.map((imgSrc, index) => (
                  <CarouselItem key={index} className="h-full pl-0">
                    <div className="relative w-full h-full min-h-[280px] md:min-h-[380px]">
                      <img
                        src={imgSrc}
                        alt={`${hostelName} photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-3 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground shadow-md border-0" />
              <CarouselNext className="right-3 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground shadow-md border-0" />
            </Carousel>

            {/* Badge indicator on top-right */}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <Badge
                variant="secondary"
                className="text-xs px-2.5 py-1 shadow bg-background/90 backdrop-blur-xs font-semibold"
              >
                {hostelType}
              </Badge>
              {isOwner && (
                <Badge
                  variant="default"
                  className="text-xs px-2.5 py-1 shadow bg-primary text-primary-foreground font-semibold"
                >
                  Your Listing
                </Badge>
              )}
            </div>

            {/* Slide count indicator on bottom-right */}
            {count > 1 && (
              <div className="absolute bottom-3 right-3 z-10 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-xs">
                {current} / {count}
              </div>
            )}
          </div>

          {/* Right: Card Content & Actions */}
          <div className="flex flex-col justify-between">
            <div>
              <CardHeader className="pt-6 px-6 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl sm:text-2xl font-bold">
                    {hostelName} - Block {block}
                  </CardTitle>
                  <span className="text-sm font-semibold bg-muted px-2.5 py-0.5 rounded text-foreground">
                    Room {roomNumber}
                  </span>
                </div>
                <div className="text-muted-foreground text-xs sm:text-sm mt-0.5">
                  Listing ID: <span className="font-mono text-xs">{roomid}</span>
                </div>
              </CardHeader>

              <CardContent className="px-6 py-3 space-y-3">
                <div className="grid grid-cols-2 gap-3 bg-muted/40 p-3.5 rounded-lg">
                  <div>
                    <span className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wider">
                      Room Capacity
                    </span>
                    <p className="text-sm font-medium mt-0.5">{seaters} Seater Room</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wider">
                      Cooling / Facility
                    </span>
                    <p className="text-sm font-medium mt-0.5">{hostelType}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wider">
                      Resident Name
                    </span>
                    <p className="text-sm font-medium mt-0.5">{residentName}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wider">
                      Posted By
                    </span>
                    <p className="text-sm font-medium mt-0.5">{ownerName}</p>
                  </div>

                  {/* Contact Info (Masked if not logged in) */}
                  <div className="col-span-2 pt-2 border-t border-border/50">
                    <span className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wider flex items-center justify-between">
                      <span>Owner Contact</span>
                      {!canViewContact && (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-normal">
                          <Lock className="w-3 h-3" /> Log in to unmask
                        </span>
                      )}
                    </span>
                    {canViewContact && phone ? (
                      <p className="text-sm font-medium text-primary mt-0.5 flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5" />
                        <a href={`tel:${phone}`} className="hover:underline">
                          +91 {phone}
                        </a>
                      </p>
                    ) : (
                      <p className="text-sm font-mono text-muted-foreground mt-0.5 flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 opacity-60" />
                        <span>{phone || "+91 98******10"}</span>
                      </p>
                    )}
                  </div>
                </div>

                {description && (
                  <div className="bg-muted/20 p-3 rounded-lg border border-border/60">
                    <span className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wider block mb-1">
                      Description / Shifting Notes
                    </span>
                    <p className="text-xs sm:text-sm text-foreground/90 whitespace-pre-line">
                      {description}
                    </p>
                  </div>
                )}
              </CardContent>
            </div>

            <CardFooter className="px-6 py-4 flex flex-col sm:flex-row gap-2.5 border-t bg-muted/30">
              {canViewContact ? (
                <Button
                  className="w-full sm:flex-1 cursor-pointer gap-2"
                  onClick={handleWhatsAppClick}
                  disabled={isContactLoading}
                >
                  {isContactLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MessageSquare className="w-4 h-4" />
                  )}
                  <span>Chat on WhatsApp</span>
                </Button>
              ) : (
                <Button
                  className="w-full sm:flex-1 cursor-pointer gap-2"
                  onClick={() => navigate("/login")}
                >
                  <Lock className="w-4 h-4" />
                  <span>Login to View Contact</span>
                </Button>
              )}

              {isOwner && (
                <Button
                  variant="destructive"
                  className="w-full sm:w-auto cursor-pointer gap-1.5"
                  onClick={handleDeleteListing}
                  disabled={isDeleting}
                  title="Remove this room listing permanently"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  <span>Delete Listing</span>
                </Button>
              )}

              {onBack && (
                <Button variant="outline" className="w-full sm:w-auto cursor-pointer" onClick={onBack}>
                  Back
                </Button>
              )}
            </CardFooter>
          </div>
        </div>
      </Card>
      )}
    </div>
  )
}
