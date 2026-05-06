import "dotenv/config";

async function seed() {
  const baseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: baseUrl,
    },
    body: JSON.stringify({
      name: "Admin",
      email: "admin@typeracer.com",
      password: "admin123456",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Failed to create admin user:", text);
    process.exit(1);
  }

  console.log("Admin user created successfully!");
  console.log("Email: admin@typeracer.com");
  console.log("Password: admin123456");
}

seed();
