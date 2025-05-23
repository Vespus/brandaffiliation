"use client"

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProfileFormValues, ProfileUpdateSchema } from "@/app/dashboard/profile/schema";
import { useCustomAction } from "@/hooks/use-custom-action";
import { updateProfileAction } from "@/app/dashboard/profile/actions";
import { toast } from "sonner";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { User } from "better-auth";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";
import { useTheme } from "next-themes";

interface ProfileFormProps {
  user: User;
}

export const ProfileForm = ({ user }: ProfileFormProps) => {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.image || null);
  const { theme: currentTheme, setTheme } = useTheme();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileUpdateSchema),
    defaultValues: {
      name: user.name || "",
      image: user.image || "",
      theme: (currentTheme as "light" | "dark" | "system") || "system",
    },
  });

  // Update form when theme changes
  useEffect(() => {
    if (currentTheme) {
      form.setValue("theme", currentTheme as "light" | "dark" | "system");
    }
  }, [currentTheme, form]);

  const updateProfileActionCall = useCustomAction(updateProfileAction, {
    onSuccess: () => {
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      toast.error(error || "Failed to update profile");
    },
  });

  const onSubmit = (values: ProfileFormValues) => {
    updateProfileActionCall.execute(values).then((result) => {
      if (result.data?.success && result.data?.theme) {
        // Update the theme
        setTheme(result.data.theme);
      }
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatarPreview(base64String);
        form.setValue("image", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>
              Update your profile information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative h-24 w-24 rounded-full overflow-hidden border border-gray-200">
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt="Avatar"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-500">
                    {user.name?.charAt(0) || "U"}
                  </div>
                )}
              </div>
              <div>
                <label
                  htmlFor="avatar-upload"
                  className="cursor-pointer text-sm text-blue-600 hover:text-blue-800"
                >
                  Change Avatar
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
            </div>

            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Theme Selection */}
            <FormField
              control={form.control}
              name="theme"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Theme Preference</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="light" />
                        </FormControl>
                        <FormLabel className="font-normal">Light</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="dark" />
                        </FormControl>
                        <FormLabel className="font-normal">Dark</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="system" />
                        </FormControl>
                        <FormLabel className="font-normal">System</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormDescription>
                    Choose your preferred theme for the application.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" loading={updateProfileActionCall.isPending}>
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
};
