import { Hono } from "hono";

const app = new Hono();

interface Score {
  Water: number;
  Air: number;
  Earth: number;
  Fire: number;
}

const quizData = [
  {
    question: "What's your ideal environment?",
    options: [
      { label: "Ocean", type: "Water" },
      { label: "Sky", type: "Air" },
      { label: "Forest", type: "Earth" },
      { label: "Volcano", type: "Fire" }
    ]
  },
  {
    question: "Pick a trait:",
    options: [
      { label: "Calm", type: "Water" },
      { label: "Free", type: "Air" },
      { label: "Grounded", type: "Earth" },
      { label: "Passionate", type: "Fire" }
    ]
  }
];

// 🟣 Farcaster Frame (الكويز)
app.get("/", (c) => {
  const ua = c.req.header("user-agent") || "";
  const isFarcaster = ua.includes("Farcaster");

  if (isFarcaster) {
    return c.json({
      version: "vNext",
      image: "https://res.cloudinary.com/dzdas1gyp/image/upload/v1750974302/og-clean_h21k6u.jpg",
      post_url: "/submit",
      buttons: [
        { label: "Start quiz", action: "post", post_data: { step: 0, score: {} } }
      ]
    });
  }

  // 🟢 Sharable Meta for Farcaster feed
  return c.html(`<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta name="fc:miniapp" content='{
        "version": "1",
        "imageUrl": "https://res.cloudinary.com/dzdas1gyp/image/upload/v1750974302/og-clean_h21k6u.jpg",
        "button": {
          "title": "🌊 Discover your element",
          "action": {
            "type": "launch_miniapp",
            "url": "https://quiz-soul.vercel.app",
            "name": "Soul Element",
            "splashImageUrl": "https://res.cloudinary.com/dzdas1gyp/image/upload/v1750974302/og-clean_h21k6u.jpg",
            "splashBackgroundColor": "#ffffff"
          }
        }
      }' />
      <title>Soul Element</title>
    </head>
    <body>
      <h1>Welcome to Soul Element Quiz</h1>
      <p>This page is sharable in Farcaster.</p>
    </body>
  </html>`);
});

// 🔁 Logic submit
app.post("/submit", async (c) => {
  const body = await c.req.json();
  const step = Number(body.step) || 0;
  const answer = body.answer as keyof Score | null;
  const score: Score = body.score || { Water: 0, Air: 0, Earth: 0, Fire: 0 };

  if (answer) {
    score[answer] = (score[answer] || 0) + 1;
  }

  if (step >= quizData.length) {
    const top = Object.entries(score).sort((a, b) => b[1] - a[1])[0][0];

    return c.json({
      version: "vNext",
      image: `https://soul-element.vercel.app/images/${top.toLowerCase()}-farcaster-hyouka.jpg`,
      buttons: [
        {
          label: "Share result",
          action: "link",
          target: `https://farcaster.xyz/~/compose?text=I+got+${top}+in+the+Soul+Element+Quiz!+Try+it:+&embeds=https://soul-element.vercel.app`
        },
        {
          label: "Try again",
          action: "link",
          target: "https://soul-element.vercel.app"
        }
      ]
    });
  }

  const current = quizData[step];

  return c.json({
    version: "vNext",
    title: current.question,
    post_url: "/submit",
    buttons: current.options.map((opt) => ({
      label: opt.label,
      action: "post",
      post_data: {
        step: step + 1,
        score,
        answer: opt.type
      }
    }))
  });
});

// 🟢 Farcaster miniapp metadata endpoint 
app.get("/.well-known/farcaster.json", (c) => {
  return c.json({
    name: "Soul Element",
    id: "soul-element-dev",
    url: "https://quiz-soul.vercel.app"
  });
});

// ✅ Export لـ Vercel 
export default app;
