import { useState, useEffect } from "react"
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

export interface RoomDetailData {
  roomid: string
  hostelName: string
  hostelType: "AC" | "Non-AC"
  image: string | string[]
  images?: string[]
  seaters: number
  blocks: string
  userName: string
  userYear: string
  userNumber?: number | string
}

interface RoomDetailsProps {
  roomid: string
  room?: RoomDetailData
  onBack?: () => void
}

export function RoomDetails({ roomid, room, onBack }: RoomDetailsProps) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

  const details: RoomDetailData = room || {
    roomid: roomid,
    hostelName: "BH-11",
    hostelType: "AC",
    image:
      "https://plus.unsplash.com/premium_photo-1716767947952-42e8fe3a28a2?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
    seaters: 2,
    blocks: "B",
    userName: "Gourav",
    userYear: "2nd Year",
    userNumber: 6295709446,
  }

  // Use provided images list or generate gallery from main image + sample room photos
  const roomImages =
    details.images && details.images.length > 0
      ? details.images
      : Array.isArray(details.image) && details.image.length > 0
      ? details.image
      : [
          typeof details.image === "string"
            ? details.image
            : "https://plus.unsplash.com/premium_photo-1716767947952-42e8fe3a28a2?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
          "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=900&auto=format&fit=crop&q=60",
          "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=900&auto=format&fit=crop&q=60",
          "https://images.unsplash.com/photo-1540518614846-7ede433c4550?w=900&auto=format&fit=crop&q=60",
        ]

  useEffect(() => {
    if (!api) {
      return
    }

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      {onBack && (
        <Button variant="outline" onClick={onBack} className="cursor-pointer">
          ← Back to All Rooms
        </Button>
      )}

      <Card className="overflow-hidden shadow-lg border border-border">
        {/* Image Carousel */}
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <Carousel setApi={setApi} className="w-full h-full">
            <CarouselContent className="h-full">
              {roomImages.map((imgSrc, index) => (
                <CarouselItem key={index} className="h-full">
                  <div className="relative aspect-video w-full h-full overflow-hidden">
                    <img
                      src={imgSrc}
                      alt={`${details.hostelName} photo ${index + 1}`}
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
          <div className="absolute top-4 right-4 z-10">
            <Badge
              variant="secondary"
              className="text-sm px-3 py-1 shadow bg-background/90 backdrop-blur-xs font-semibold"
            >
              {details.hostelType}
            </Badge>
          </div>

          {/* Slide count indicator on bottom-right */}
          {count > 1 && (
            <div className="absolute bottom-3 right-3 z-10 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-xs">
              {current} / {count}
            </div>
          )}
        </div>

        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {details.hostelName} - Block {details.blocks}
          </CardTitle>
          <div className="text-muted-foreground text-sm">
            Room ID: <span className="font-mono">{details.roomid}</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/40 p-4 rounded-lg">
            <div>
              <span className="text-xs text-muted-foreground uppercase font-semibold">
                Room Capacity
              </span>
              <p className="text-base font-medium">{details.seaters} Seater Room</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground uppercase font-semibold">
                Cooling / Facility
              </span>
              <p className="text-base font-medium">{details.hostelType}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground uppercase font-semibold">
                Current Resident
              </span>
              <p className="text-base font-medium">{details.userName}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground uppercase font-semibold">
                Academic Year
              </span>
              <p className="text-base font-medium">{details.userYear}</p>
            </div>
            {details.userNumber && (
              <div className="sm:col-span-2">
                <span className="text-xs text-muted-foreground uppercase font-semibold">
                  Contact Number
                </span>
                <p className="text-base font-medium text-primary">
                  <a href={`tel:${details.userNumber}`} className="hover:underline">
                    +91 {details.userNumber}
                  </a>
                </p>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3">
          {details.userNumber && (
            <Button
              className="w-full sm:flex-1"
              onClick={() => window.open(`https://wa.me/91${details.userNumber}`, "_blank")}
            >
              Chat on WhatsApp
            </Button>
          )}
          {onBack && (
            <Button variant="outline" className="w-full sm:flex-1" onClick={onBack}>
              Back to Listings
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
