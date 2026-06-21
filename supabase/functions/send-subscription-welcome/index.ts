import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

Deno.serve(async (req) => {
  // 1. Retrieve environment variables
  const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const FRONTEND_URL = Deno.env.get("FRONTEND_URL") || "https://krabhishek.vercel.app";
  const SENDER_EMAIL = Deno.env.get("SENDER_EMAIL") || "krabhishek0321@gmail.com";
  const SENDER_NAME = Deno.env.get("SENDER_NAME") || "Portfolio Abhishek";

  if (!BREVO_API_KEY) {
    console.error("Missing BREVO_API_KEY environment variable.");
    return new Response(JSON.stringify({ error: "Configuration Error: BREVO_API_KEY is missing." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // 2. Parse the Webhook payload
    const payload = await req.json();
    console.log(`Received webhook event: ${payload.type} on table: ${payload.table}`);

    // Verify it is an INSERT event on the subscribers table
    if (payload.type !== "INSERT" || payload.table !== "subscribers") {
      return new Response(JSON.stringify({ message: "Ignored: Only INSERT events on 'subscribers' table are processed." }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const subscriber = payload.record;
    if (!subscriber || !subscriber.email || !subscriber.id) {
      return new Response(JSON.stringify({ error: "Invalid record: email or id is missing." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`Processing subscription welcome email for: ${subscriber.email}`);

    const unsubscribeUrl = `${FRONTEND_URL}/unsubscribe?token=${subscriber.id}`;
    const homepageUrl = FRONTEND_URL;

    // Premium Dracula / Developer styled HTML template
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to the Developer Log!</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #030014;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #c5c6c7;
      -webkit-font-smoothing: antialiased;
    }
    .email-container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #0d0d16;
      border: 1px solid rgba(189, 147, 249, 0.3);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
    }
    .header-bar {
      background-color: #181824;
      padding: 14px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    .dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      display: inline-block;
      margin-right: 6px;
    }
    .dot-red { background-color: #ff5f56; }
    .dot-yellow { background-color: #ffbd2e; }
    .dot-green { background-color: #27c93f; }
    .header-title {
      color: #6272a4;
      font-family: monospace;
      font-size: 11px;
      margin-left: 10px;
      vertical-align: middle;
    }
    .content-body {
      padding: 36px 32px;
      text-align: left;
    }
    .tag-badge {
      display: inline-block;
      background-color: rgba(139, 233, 253, 0.1);
      color: #8be9fd;
      border: 1px solid rgba(139, 233, 253, 0.25);
      border-radius: 6px;
      padding: 4px 10px;
      font-size: 10px;
      font-family: monospace;
      font-weight: bold;
      margin-bottom: 24px;
      letter-spacing: 0.5px;
    }
    .welcome-title {
      font-size: 24px;
      font-weight: 800;
      color: #ffffff;
      margin: 0 0 18px 0;
      line-height: 1.3;
    }
    .msg-paragraph {
      font-size: 14px;
      line-height: 1.7;
      color: #b0b3c6;
      margin-top: 0;
      margin-bottom: 18px;
    }
    .highlight-box {
      font-size: 14px;
      line-height: 1.6;
      color: #f8f8f2;
      margin: 24px 0;
      border-left: 3px solid #bd93f9;
      padding-left: 16px;
      background-color: rgba(189, 147, 249, 0.04);
      padding-top: 12px;
      padding-bottom: 12px;
      padding-right: 12px;
    }
    .btn-container {
      margin: 32px 0 12px 0;
      text-align: left;
    }
    .action-btn {
      display: inline-block;
      background: linear-gradient(90deg, #6366f1 0%, #a855f7 100%);
      color: #ffffff !important;
      text-decoration: none !important;
      padding: 12px 28px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: bold;
      font-family: monospace;
      letter-spacing: 0.5px;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
    }
    .signature-block {
      margin-top: 32px;
      font-size: 14px;
      color: #9ab0c2;
      line-height: 1.6;
    }
    .signature-comment {
      font-family: monospace;
      color: #6272a4;
      font-size: 12px;
    }
    .footer {
      padding: 24px 32px;
      background-color: #08080f;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      text-align: center;
      font-size: 11px;
      color: #6272a4;
      line-height: 1.6;
    }
    .footer a {
      color: #ff79c6;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header-bar">
      <span class="dot dot-red"></span>
      <span class="dot dot-yellow"></span>
      <span class="dot dot-green"></span>
      <span class="header-title">abhishek-portfolio ~ system/newsletter</span>
    </div>
    <div class="content-body">
      <div class="tag-badge">SUBSCRIPTION_ACTIVE</div>
      <h1 class="welcome-title">Thanks for subscribing! 🚀</h1>
      
      <p class="msg-paragraph">
        Hi there,
      </p>
      <p class="msg-paragraph">
        I am super happy that you liked my content and decided to subscribe to my blog posts! Your support means a lot to me and fuels my commitment to sharing high-quality, practical software engineering content.
      </p>

      <div class="highlight-box">
        <strong>What's heading your way?</strong><br>
        You'll get direct notifications as soon as a new article compiles. Stay tuned for upcoming deep-dives covering enterprise Java engineering, data structures & algorithms (DSA), scalable MERN/MEAN stack applications, system architecture patterns, and interactive developer guides.
      </div>

      <div style="font-family: monospace; background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); padding: 14px 18px; border-radius: 8px; margin: 24px 0; font-size: 12.5px;">
        <span style="color: #6272a4;">// My primary engineering ecosystem</span><br>
        <span style="color: #ff79c6;">const</span> mainTechStack = [<br>
        &nbsp;&nbsp;<span style="color: #f1fa8c;">"Java Full Stack"</span>, <br>
        &nbsp;&nbsp;<span style="color: #f1fa8c;">"DSA (Data Structures & Algorithms)"</span>, <br>
        &nbsp;&nbsp;<span style="color: #f1fa8c;">"MERN Stack"</span>, <br>
        &nbsp;&nbsp;<span style="color: #f1fa8c;">"MEAN Stack"</span><br>
        ];
      </div>

      <p class="msg-paragraph">
        In the meantime, feel free to head back to my developer dashboard, explore my catalog of projects and certifications, play around with the built-in sandbox mini-games, or solve interactive developer challenges.
      </p>

      <div class="btn-container">
        <a href="${homepageUrl}" class="action-btn" target="_blank">&gt; RUN visit_portfolio.sh</a>
      </div>

      <div class="signature-block">
        Keep Compiling,<br>
        <strong>Abhishek Kumar</strong><br>
        <span class="signature-comment">// Software Developer - Java Full Stack</span>
      </div>
    </div>
    <div class="footer">
      You are receiving this because you subscribed to Abhishek Kumar's blogs.
      <br><br>
      <a href="${unsubscribeUrl}" target="_blank">Unsubscribe</a> | <a href="${homepageUrl}" target="_blank">Visit Portfolio</a>
    </div>
  </div>
</body>
</html>
    `;

    // 3. Dispatch the email via Brevo REST API
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
        "accept": "application/json"
      },
      body: JSON.stringify({
        sender: { name: SENDER_NAME, email: SENDER_EMAIL },
        to: [{ email: subscriber.email }],
        subject: "Thanks for Subscribing! 🚀",
        htmlContent: htmlContent
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Brevo API call failed for ${subscriber.email}: Status ${response.status}`, errText);
      return new Response(JSON.stringify({ error: `Brevo API returned error status: ${response.status}`, details: errText }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`Successfully sent welcome email to: ${subscriber.email}`);
    return new Response(JSON.stringify({ message: `Success: Sent welcome email to ${subscriber.email}.` }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Unhandled execution exception:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
