import { Loader2, Camera, X, Check, CalendarIcon } from "lucide-react";
import Cropper from "react-easy-crop";
import { format } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/animate-ui/components/radix/dialog";
import { RippleButton } from "@/components/animate-ui/components/buttons/ripple";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { type UserResponse } from "@/api-client";
import { useEditProfile } from "../hooks/useEditProfile";
import { SKILLS, INTERESTS } from "../schemas/profileSchema";

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentProfile: UserResponse;
}

const formatLabel = (value: string) => {
  return value
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
};

export const EditProfileModal = ({
  open,
  onOpenChange,
  currentProfile,
}: EditProfileModalProps) => {
  const {
    form,
    isSubmitting,
    previewUrl,
    isCropping,
    cropImageSrc,
    crop,
    setCrop,
    zoom,
    setZoom,
    fileInputRef,
    handleImageSelect,
    onCropComplete,
    handleCropConfirm,
    handleCropCancel,
    onSubmit,
  } = useEditProfile({ currentProfile, open, onOpenChange });

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!isCropping) onOpenChange(val);
      }}
    >
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information. Click save when you are done.
          </DialogDescription>
        </DialogHeader>

        {isCropping && cropImageSrc ? (
          <div className="flex flex-col gap-4">
            <div className="relative h-[300px] w-full bg-black rounded-lg overflow-hidden">
              <Cropper
                image={cropImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="flex items-center gap-4 px-4">
              <span className="text-sm text-muted-foreground w-12">Zoom</span>
              <Slider
                value={[zoom]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={(value: number[]) => setZoom(value[0])}
                className="flex-1"
              />
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="outline" onClick={handleCropCancel}>
                <X className="mr-2 h-4 w-4" /> Cancel
              </Button>
              <Button onClick={handleCropConfirm}>
                <Check className="mr-2 h-4 w-4" /> Apply Crop
              </Button>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Profile Picture Upload */}
              <div className="flex flex-col items-center gap-4">
                <div
                  className="relative group cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Avatar className="h-24 w-24 border-2 border-muted">
                    <AvatarImage src={previewUrl || undefined} />
                    <AvatarFallback className="text-2xl">
                      {currentProfile.name?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageSelect}
                />
                <p className="text-xs text-muted-foreground">
                  Click to change photo (max 5MB)
                </p>
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Your name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="City, Country" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Tell us about yourself..."
                        rows={4}
                        className="resize-none"
                      />
                    </FormControl>
                    <FormDescription>Maximum 500 characters</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skills</FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        <ToggleGroup
                          type="multiple"
                          value={field.value || []}
                          onValueChange={field.onChange}
                          className="flex-wrap justify-start gap-2"
                        >
                          {SKILLS.map((skill) => (
                            <ToggleGroupItem
                              key={skill}
                              value={skill}
                              variant="outline"
                              size="sm"
                              className="text-xs"
                            >
                              {formatLabel(skill)}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Select skills that apply to you
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="interests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interests</FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        <ToggleGroup
                          type="multiple"
                          value={field.value || []}
                          onValueChange={field.onChange}
                          className="flex-wrap justify-start gap-2"
                        >
                          {INTERESTS.map((interest) => (
                            <ToggleGroupItem
                              key={interest}
                              value={interest}
                              variant="outline"
                              size="sm"
                              className="text-xs"
                            >
                              {formatLabel(interest)}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Select causes you care about
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="+1234567890" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="City, Country" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        max={new Date().toISOString().split("T")[0]}
                        min="1900-01-01"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Tell us about yourself..."
                        rows={4}
                        className="resize-none"
                      />
                    </FormControl>
                    <FormDescription>Maximum 500 characters</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skills</FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        <ToggleGroup
                          type="multiple"
                          value={field.value || []}
                          onValueChange={field.onChange}
                          className="flex-wrap justify-start gap-2"
                        >
                          {SKILLS.map((skill) => (
                            <ToggleGroupItem
                              key={skill}
                              value={skill}
                              variant="outline"
                              size="sm"
                              className="text-sm data-[state=on]:bg-green-600 data-[state=on]:text-white data-[state=on]:border-green-600 hover:bg-green-50 transition-colors"
                            >
                              {formatLabel(skill)}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Select skills that apply to you
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="interests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interests</FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        <ToggleGroup
                          type="multiple"
                          value={field.value || []}
                          onValueChange={field.onChange}
                          className="flex-wrap justify-start gap-2"
                        >
                          {INTERESTS.map((interest) => (
                            <ToggleGroupItem
                              key={interest}
                              value={interest}
                              variant="outline"
                              size="sm"
                              className="text-sm data-[state=on]:bg-green-600 data-[state=on]:text-white data-[state=on]:border-green-600 hover:bg-green-50 transition-colors"
                            >
                              {formatLabel(interest)}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Select causes you care about
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2">
                <RippleButton
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                  className="border-2"
                >
                  Cancel
                </RippleButton>
                <RippleButton
                  type="submit"
                  disabled={isSubmitting}
                  variant="green"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </RippleButton>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};
