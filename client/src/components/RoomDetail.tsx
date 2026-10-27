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
                className="text-xs px-2.5 py-1 shadow bg-background/90 backdrop-blur-xs font-semibold"
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

          {/* Right: Card Content & Actions */}
          <div className="flex flex-col justify-between">
            <div>
              <CardHeader className="pt-6 px-6 pb-2">
                <CardTitle className="text-xl sm:text-2xl font-bold">
                  {details.hostelName} - Block {details.blocks}
                </CardTitle>
                <div className="text-muted-foreground text-xs sm:text-sm mt-0.5">
                  Room ID: <span className="font-mono">{details.roomid}</span>
                </div>
              </CardHeader>

              <CardContent className="px-6 py-3">
                <div className="grid grid-cols-2 gap-3 bg-muted/40 p-3.5 rounded-lg">
                  <div>
                    <span className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wider">
                      Room Capacity
                    </span>
                    <p className="text-sm font-medium mt-0.5">{details.seaters} Seater Room</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wider">
                      Cooling / Facility
                    </span>
                    <p className="text-sm font-medium mt-0.5">{details.hostelType}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wider">
                      Current Resident
                    </span>
                    <p className="text-sm font-medium mt-0.5">{details.userName}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wider">
                      Academic Year
                    </span>
                    <p className="text-sm font-medium mt-0.5">{details.userYear}</p>
                  </div>
                  {details.userNumber && (
                    <div className="col-span-2 pt-2 border-t border-border/50">
                      <span className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wider">
                        Contact Number
                      </span>
                      <p className="text-sm font-medium text-primary mt-0.5">
                        <a href={`tel:${details.userNumber}`} className="hover:underline">
                          +91 {details.userNumber}
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </div>

            <CardFooter className="px-6 py-4 flex flex-col sm:flex-row gap-2.5 border-t bg-muted/30">
              {details.userNumber && (
                <Button
                  className="w-full sm:flex-1 cursor-pointer"
                  onClick={() => window.open(`https://wa.me/91${details.userNumber}`, "_blank")}
                >
                  Chat on WhatsApp
                </Button>
              )}
              {onBack && (
                <Button variant="outline" className="w-full sm:flex-1 cursor-pointer" onClick={onBack}>
                  Back to Listings
                </Button>
              )}
            </CardFooter>
          </div>
        </div>
      </Card>
    </div>
  )
}
