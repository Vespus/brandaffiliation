import { getUser } from "@/lib/get-user";
import { ProfileForm } from "@/app/dashboard/profile/profile-form";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const metadata = {
  title: "Profile | Brand Affiliation",
  description: "Manage your profile settings",
};

export default async function ProfilePage() {
  const { user } = await getUser();
  
  // Fetch the complete user data from the database
  const userData = await db.query.users.findFirst({
    where: eq(users.id, user.id),
  });

  if (!userData) {
    throw new Error("User not found");
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>
        <ProfileForm user={userData} />
      </div>
    </div>
  );
}