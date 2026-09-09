import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/signup`
const anon = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)!

async function check() {
  const start = Date.now()
  console.log("Sending raw POST to", url)
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        apikey: anon,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: `raw_test_${Date.now()}@example.com`,
        password: "Password123!",
        data: { full_name: "Raw Test" },
      }),
    })
    console.log(`Status: ${res.status}, Time: ${Date.now() - start}ms`)
    const text = await res.text()
    console.log("Body:", text)
  } catch (e) {
    console.error(`Fetch error in ${Date.now() - start}ms:`, e)
  }
}

check()
