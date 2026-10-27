import * as React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Upload, X, Image as ImageIcon } from "lucide-react"

const hostelOptions = [
  { label: "Hostel 1", value: "Hostel 1" },
  { label: "Hostel 2", value: "Hostel 2" },
  { label: "Hostel 3", value: "Hostel 3" },
  { label: "Hostel 4", value: "Hostel 4" },
  { label: "BH-1", value: "BH-1" },
  { label: "BH-2", value: "BH-2" },
  { label: "BH-3", value: "BH-3" },
  { label: "BH-4", value: "BH-4" },
  { label: "BH-5", value: "BH-5" },
  { label: "GH-1", value: "GH-1" },
  { label: "GH-2", value: "GH-2" },
  { label: "GH-3", value: "GH-3" },
]

const typeOptions = [
  { label: "AC", value: "AC" },
  { label: "Non-AC", value: "Non-AC" },
]

const blockOptions = [
  { label: "Block A", value: "A" },
  { label: "Block B", value: "B" },
  { label: "Block C", value: "C" },
  { label: "Block D", value: "D" },
]

const seaterOptions = [
  { label: "1 Seater", value: "1" },
  { label: "2 Seater", value: "2" },
  { label: "3 Seater", value: "3" },
  { label: "4 Seater", value: "4" },
  { label: "5 Seater", value: "5" },
]

export function RoomAdd() {
  const navigate = useNavigate()
  const [photos, setPhotos] = useState<string[]>([])

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const fileList = Array.from(files)
    fileList.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotos((prev) => [...prev, event.target!.result as string])
        }
      }
      reader.readAsDataURL(file)
    })

    // Reset input value so the same file can be re-selected if deleted
    e.target.value = ""
  }

  const removePhoto = (indexToRemove: number) => {
    setPhotos((prev) => prev.filter((_, index) => index !== indexToRemove))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Redirect back to home after listing submission
    navigate("/")
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <Card className="shadow-lg border border-border p-6 sm:p-8">
        <CardHeader className="px-0 pt-0 pb-6 border-b mb-6">
          <CardTitle className="text-2xl font-bold">Add Room Listing</CardTitle>
          <CardDescription>
            Enter your room details, upload photos, and list your room for shifting.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <FieldGroup className="space-y-4">
            {/* Hostel and Block Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="form-hostel">Hostel</FieldLabel>
                <Select items={hostelOptions} defaultValue="Hostel 1">
                  <SelectTrigger id="form-hostel" className="w-full">
                    <SelectValue placeholder="Select hostel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {hostelOptions.map((h) => (
                        <SelectItem key={h.value} value={h.value}>
                          {h.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="form-block">Block</FieldLabel>
                <Select items={blockOptions} defaultValue="A">
                  <SelectTrigger id="form-block" className="w-full">
                    <SelectValue placeholder="Select block" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {blockOptions.map((b) => (
                        <SelectItem key={b.value} value={b.value}>
                          {b.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            {/* Room Number (Normal Input) and Seater Dropdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="form-room-number">Room Number</FieldLabel>
                <Input
                  id="form-room-number"
                  type="text"
                  placeholder="e.g. 402, 315-B"
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="form-seater">Seater</FieldLabel>
                <Select items={seaterOptions} defaultValue="2">
                  <SelectTrigger id="form-seater" className="w-full">
                    <SelectValue placeholder="Select seaters" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {seaterOptions.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            {/* Type (AC/Non-AC) Dropdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="form-type">Type (AC/Non-AC)</FieldLabel>
                <Select items={typeOptions} defaultValue="AC">
                  <SelectTrigger id="form-type" className="w-full">
                    <SelectValue placeholder="Select cooling type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {typeOptions.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="form-resident-name">Resident Name</FieldLabel>
                <Input
                  id="form-resident-name"
                  type="text"
                  placeholder="Your full name"
                  required
                />
              </Field>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="form-phone">Phone / WhatsApp</FieldLabel>
                <Input
                  id="form-phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="form-email">Email (Optional)</FieldLabel>
                <Input
                  id="form-email"
                  type="email"
                  placeholder="student@lpu.in"
                />
              </Field>
            </div>

            {/* Photo Upload Field */}
            <Field>
              <FieldLabel>Room Photos</FieldLabel>
              <div className="space-y-3">
                <label
                  htmlFor="room-photos-upload"
                  className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/60 hover:bg-muted/40 transition-colors"
                >
                  <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    Click to upload or drag & drop room photos
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    Upload images of the room, beds, washroom (JPG, PNG, WebP)
                  </span>
                  <input
                    id="room-photos-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </label>

                {photos.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-1">
                    {photos.map((src, index) => (
                      <div
                        key={index}
                        className="relative group aspect-video rounded-lg overflow-hidden border border-border bg-muted shadow-xs"
                      >
                        <img
                          src={src}
                          alt={`Uploaded preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-1 right-1 bg-black/70 hover:bg-destructive text-white p-1 rounded-full opacity-80 group-hover:opacity-100 transition-all cursor-pointer shadow"
                          aria-label="Remove photo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <FieldDescription>
                {photos.length === 0 ? (
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" />
                    You can upload multiple photos for the gallery carousel.
                  </span>
                ) : (
                  <span>{photos.length} photo(s) selected.</span>
                )}
              </FieldDescription>
            </Field>

            {/* Form Actions */}
            <Field orientation="horizontal" className="pt-4 flex justify-end gap-3 border-t">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => navigate("/")}
              >
                Cancel
              </Button>
              <Button type="submit" className="cursor-pointer">
                Submit Room Listing
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </Card>
    </div>
  )
}

export { RoomAdd as InputForm }
export default RoomAdd
