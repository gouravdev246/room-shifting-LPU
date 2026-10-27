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
import { useState } from "react"
import { RoomDetails, type RoomDetailData } from "./RoomDetail"

export function HostelDetailsCard() {
  const [selectedRoom, setSelectedRoom] = useState<RoomDetailData | null>(null)
  const [hostelsDetails] = useState<RoomDetailData[]>([
    {
        roomid : "asdv" , 
        hostelName : "Hostel 1",
        image : ["https://images.unsplash.com/photo-1709805619372-40de3f158e83?q=80&w=1790&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D", "https://images.unsplash.com/photo-1721076748121-bbf3b6a15d09?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D"],
        hostelType : "AC",
        seaters : 2,
        blocks : "A",
        userName : "Gourav Sarkar",
        userYear : "2022"
    },
    {
        roomid : "asdv" , 
        hostelName : "Hostel 1",
        hostelType : "AC",
        image : ["https://plus.unsplash.com/premium_photo-1716767947952-42e8fe3a28a2?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D" , "https://plus.unsplash.com/premium_photo-1716767947952-42e8fe3a28a2?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D"],
        seaters : 2,
        blocks : "B",
        userName : "Shashank",
        userYear : "2022",
        userNumber : 6295709446
    },
    {
        roomid : "asdv" , 
        hostelName : "Hostel 1",
        hostelType : "AC",
        image : ["https://plus.unsplash.com/premium_photo-1717014211334-8ae3b98a5965?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D", "https://images.unsplash.com/photo-1721076748121-bbf3b6a15d09?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D"],
        seaters : 2,
        blocks : "B",
        userName : "Shashank",
        userYear : "2022"
    },
    {
        roomid : "asdv" , 
        hostelName : "Hostel 1",
        hostelType : "AC",
        image : ["https://images.unsplash.com/photo-1709805619372-40de3f158e83?q=80&w=1790&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D", "https://images.unsplash.com/photo-1721076748121-bbf3b6a15d09?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D"],
        seaters : 2,
        blocks : "B",
        userName : "Shashank",
        userYear : "2022"
    },
    {
        roomid : "asdv" , 
        hostelName : "Hostel 1",
        hostelType : "AC",
        image : ["https://plus.unsplash.com/premium_photo-1717026836061-32ec43465f9b?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D", "https://images.unsplash.com/photo-1721076748121-bbf3b6a15d09?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D"],
        seaters : 2,
        blocks : "B",
        userName : "Shashank",
        userYear : "2022"
    },
    ])

  if (selectedRoom) {
    return (
      <RoomDetails
        roomid={selectedRoom.roomid}
        room={selectedRoom}
        onBack={() => setSelectedRoom(null)}
      />
    )
  }

  return (
    <>
      <div className="text-left pl-6 pt-6 font-medium text-muted-foreground">
        All Rooms ({hostelsDetails.length})
      </div>
      <div className="flex flex-row flex-wrap items-stretch justify-start gap-6 p-6">
        {hostelsDetails.map((hostel, index) => (
          <Card key={index} className="relative w-[320px] max-w-sm pt-0 overflow-hidden shadow-sm">
            <img
              src={Array.isArray(hostel.image) ? hostel.image[0] : hostel.image}
              alt={hostel.hostelName}
              className="aspect-video w-full object-cover"
            />
            <CardHeader>
              <CardAction>
                <Badge variant="secondary">{hostel.hostelType}</Badge>
              </CardAction>
              <CardTitle>Hostel : {hostel.hostelName}</CardTitle>
              <CardDescription>Type : {hostel.hostelType}</CardDescription>
              <CardDescription>Seater : {hostel.seaters}</CardDescription>
              <CardDescription>Blocks : {hostel.blocks}</CardDescription>
              <CardDescription>User Name : {hostel.userName}</CardDescription>
              <CardDescription>User Year : {hostel.userYear}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button
                className="w-full cursor-pointer"
                onClick={() => setSelectedRoom(hostel)}
              >
                View Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  )
}
