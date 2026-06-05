import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

Deno.serve(async (req) => {
  // 1. Authenticate and retrieve environment variables
  const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const FRONTEND_URL = Deno.env.get("FRONTEND_URL") || "https://krabhishek.vercel.app";
  const SENDER_EMAIL = Deno.env.get("SENDER_EMAIL") || "krabhishek2k02@gmail.com";
  const SENDER_NAME = Deno.env.get("SENDER_NAME") || "Abhishek Kumar";

  if (!BREVO_API_KEY) {
    console.error("Missing BREVO_API_KEY environment variable.");
    return new Response(JSON.stringify({ error: "Configuration Error: BREVO_API_KEY is missing." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing Supabase configuration environment variables.");
    return new Response(JSON.stringify({ error: "Configuration Error: Supabase credentials missing." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // 2. Parse the Webhook payload
    const payload = await req.json();
    console.log(`Received webhook event: ${payload.type} on table: ${payload.table}`);

    // Verify it is an INSERT event on the blogs table
    if (payload.type !== "INSERT" || payload.table !== "blogs") {
      return new Response(JSON.stringify({ message: "Ignored: Only INSERT events on 'blogs' table are processed." }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const blog = payload.record;
    if (!blog || !blog.title || !blog.slug) {
      return new Response(JSON.stringify({ error: "Invalid record: title or slug is missing." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 3. Create Supabase client with Service Role to bypass Row Level Security (RLS)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 4. Fetch all email subscribers
    console.log("Fetching newsletter subscribers...");
    const { data: subscribers, error: dbError } = await supabase
      .from("subscribers")
      .select("id, email");

    if (dbError) {
      console.error("Database error fetching subscribers:", dbError);
      throw dbError;
    }

    if (!subscribers || subscribers.length === 0) {
      console.log("No active subscribers found. Exiting.");
      return new Response(JSON.stringify({ message: "Success: No subscribers to notify." }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`Found ${subscribers.length} subscribers. Dispatching notifications via Brevo...`);

    const readTime = blog.read_time || "5 min read";
    const blogUrl = `${FRONTEND_URL}/blog/${blog.slug}`;
    
    let sentCount = 0;
    const errors = [];

    // 5. Send individualized emails via Brevo API
    // We send individual requests to ensure each subscriber gets a personalized unsubscribe link.
    const sendPromises = subscribers.map(async (subscriber) => {
      const unsubscribeUrl = `${FRONTEND_URL}/unsubscribe?token=${subscriber.id}`;
      
      // Premium Dracula / VS Code styled HTML template
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Blog Compiled: ${blog.title}</title>
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
      border: 1px solid rgba(189, 147, 249, 0.25);
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
      padding: 32px;
      text-align: left;
    }
    .tag-badge {
      display: inline-block;
      background-color: rgba(99, 102, 241, 0.12);
      color: #8be9fd;
      border: 1px solid rgba(99, 102, 241, 0.25);
      border-radius: 6px;
      padding: 4px 10px;
      font-size: 10px;
      font-family: monospace;
      font-weight: bold;
      margin-bottom: 20px;
      letter-spacing: 0.5px;
    }
    .blog-title {
      font-size: 22px;
      font-weight: 800;
      color: #ffffff;
      margin: 0 0 12px 0;
      line-height: 1.3;
    }
    .meta-row {
      font-family: monospace;
      font-size: 11px;
      color: #6272a4;
      margin-bottom: 20px;
    }
    .blog-description {
      font-size: 13.5px;
      line-height: 1.6;
      color: #f8f8f2;
      margin-bottom: 24px;
      border-left: 3px solid #6366f1;
      padding-left: 14px;
      font-style: italic;
      background-color: rgba(99, 102, 241, 0.04);
      padding-top: 8px;
      padding-bottom: 8px;
      padding-right: 8px;
    }
    .msg-intro {
      font-size: 13.5px;
      line-height: 1.6;
      color: #9ab0c2;
      margin: 0 0 28px 0;
    }
    .btn-container {
      margin: 28px 0;
    }
    .read-btn {
      display: inline-block;
      background: linear-gradient(90deg, #6366f1 0%, #a855f7 100%);
      color: #ffffff !important;
      text-decoration: none !important;
      padding: 12px 24px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: bold;
      font-family: monospace;
      letter-spacing: 0.5px;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
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
      <span class="header-title">abhishek-portfolio ~ workspace/blog</span>
    </div>
    <div class="content-body">
      <div class="tag-badge">NEW_POST_COMPILED</div>
      <h1 class="blog-title">${blog.title}</h1>
      <div class="meta-row">
        <span>// Read Time: ${readTime} | Published: ${new Date(blog.published_date).toLocaleDateString()}</span>
      </div>
      <div class="blog-description">
        "${blog.description}"
      </div>
      <p class="msg-intro">
        Hello! A new article has been compiled and deployed to the blog registry. Click the button below to inspect the logs and read the full article within the interactive terminal developer workspace.
      </p>
      <div class="btn-container">
        <a href="${blogUrl}" class="read-btn" target="_blank">&gt; RUN cat_blog.sh</a>
      </div>
    </div>
    <div class="footer">
      You are receiving this because you subscribed to Abhishek Kumar's blogs.
      <br><br>
      <a href="${unsubscribeUrl}" target="_blank">Unsubscribe</a> | <a href="${FRONTEND_URL}" target="_blank">Visit Portfolio</a>
    </div>
  </div>
</body>
</html>
      `;

      try {
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
            subject: `New Blog: ${blog.title}`,
            htmlContent: htmlContent
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error(`Brevo API call failed for ${subscriber.email}: Status ${response.status}`, errText);
          errors.push({ email: subscriber.email, status: response.status, error: errText });
        } else {
          console.log(`Successfully sent email notification to ${subscriber.email}`);
          sentCount++;
        }
      } catch (fetchErr) {
        console.error(`Network error sending to ${subscriber.email}:`, fetchErr.message);
        errors.push({ email: subscriber.email, error: fetchErr.message });
      }
    });

    // Resolve all email dispatches in parallel
    await Promise.all(sendPromises);

    if (errors.length > 0) {
      console.error(`Completed with errors. Notified ${sentCount} subscribers. Errors:`, errors);
      return new Response(JSON.stringify({
        message: `Partial success: notified ${sentCount} subscribers.`,
        errors: errors,
      }), {
        status: 207,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`Successfully notified all ${sentCount} subscribers.`);
    return new Response(JSON.stringify({ message: `Success: notified all ${sentCount} subscribers.` }), {
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
