import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

async function main() {
  console.log("Testing auth.admin.createUser with email_confirm: true...")
  const start = Date.now()
  const testEmail = `admin_created_${Date.now()}@example.com`

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: testEmail,
    password: "TestPassword123!",
    email_confirm: true,
    user_metadata: { full_name: "Test Admin Created" },
  })

  console.log(`Finished in ${Date.now() - start}ms`)
  if (error) {
    console.error("Error creating user:", error)
  } else {
    console.log("Created User successfully! ID:", data.user?.id)

    // Check if profile was created by trigger
    const { data: profile, error: profError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", data.user!.id)
      .single()

    console.log("Profile created by trigger:", profile, "Prof error:", profError)

    // Clean up
    await supabaseAdmin.auth.admin.deleteUser(data.user!.id)
    console.log("Cleaned up test user.")
  }
}

main()
