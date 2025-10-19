import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function sendCriticalIssueEmail(messages: any[], userContext: string) {
  const smtpHost = Deno.env.get('SMTP_HOST');
  const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '587');
  const smtpUser = Deno.env.get('SMTP_USER');
  const smtpPassword = Deno.env.get('SMTP_PASSWORD');
  const smtpFrom = Deno.env.get('SMTP_FROM_EMAIL') || smtpUser;

  if (!smtpHost || !smtpUser || !smtpPassword) {
    console.error('SMTP not configured');
    return;
  }

  const client = new SMTPClient({
    connection: {
      hostname: smtpHost,
      port: smtpPort,
      tls: true,
      auth: {
        username: smtpUser,
        password: smtpPassword,
      },
    },
  });

  // Extract image from messages if present
  let imageAttachment = null;
  let imageBase64 = null;
  
  for (const msg of messages) {
    if (Array.isArray(msg.content)) {
      const imageContent = msg.content.find((c: any) => c.type === 'image_url');
      if (imageContent?.image_url?.url) {
        const base64Match = imageContent.image_url.url.match(/^data:image\/(.*?);base64,(.*)$/);
        if (base64Match) {
          const [, extension, data] = base64Match;
          imageBase64 = data;
          imageAttachment = {
            filename: `chat-image.${extension}`,
            content: data,
            encoding: 'base64' as const,
            contentType: `image/${extension}`,
          };
          break;
        }
      }
    }
  }

  // Format chat thread as beautiful HTML
  const chatMessagesHtml = messages.map((msg: any, i: number) => {
    const isUser = msg.role === 'user';
    let content = '';
    let hasImage = false;
    
    if (typeof msg.content === 'string') {
      content = msg.content.replace(/\n/g, '<br>');
    } else if (Array.isArray(msg.content)) {
      const textContent = msg.content.find((c: any) => c.type === 'text');
      if (textContent?.text) {
        content = textContent.text.replace(/\n/g, '<br>');
      }
      hasImage = msg.content.some((c: any) => c.type === 'image_url');
    }
    
    return `
      <div style="margin-bottom: 20px; display: flex; ${isUser ? 'justify-content: flex-end;' : 'justify-content: flex-start;'}">
        <div style="max-width: 70%; background: ${isUser ? '#007bff' : '#f1f3f4'}; color: ${isUser ? '#ffffff' : '#000000'}; padding: 12px 16px; border-radius: 12px; ${isUser ? 'border-top-right-radius: 4px;' : 'border-top-left-radius: 4px;'}">
          <div style="font-weight: 600; font-size: 12px; margin-bottom: 6px; opacity: 0.8;">
            ${isUser ? '👤 USER' : '🤖 ASSISTANT'}
          </div>
          ${hasImage ? '<div style="margin-bottom: 8px; font-style: italic; opacity: 0.9;">📎 Image attached (see attachment)</div>' : ''}
          <div style="font-size: 14px; line-height: 1.5;">
            ${content}
          </div>
        </div>
      </div>
    `;
  }).join('');

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f8f9fa;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .context {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px 20px;
      margin: 20px;
      border-radius: 4px;
    }
    .context h3 {
      margin: 0 0 10px 0;
      color: #856404;
      font-size: 16px;
    }
    .context p {
      margin: 5px 0;
      color: #856404;
      font-size: 14px;
      line-height: 1.6;
    }
    .chat-thread {
      padding: 20px;
      background-color: #ffffff;
    }
    .chat-thread h2 {
      margin: 0 0 20px 0;
      font-size: 18px;
      color: #333;
      border-bottom: 2px solid #e9ecef;
      padding-bottom: 10px;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px;
      text-align: center;
      color: #6c757d;
      font-size: 12px;
      border-top: 1px solid #dee2e6;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚨 Critical Support Chat Issue Detected</h1>
    </div>
    
    ${userContext ? `
    <div class="context">
      <h3>📋 User Context</h3>
      <p>${userContext.replace(/\n/g, '<br>')}</p>
    </div>
    ` : ''}
    
    <div class="chat-thread">
      <h2>💬 Chat Thread</h2>
      ${chatMessagesHtml}
    </div>
    
    <div class="footer">
      This email was automatically generated when a critical issue was detected in the support chat.
      <br>
      <strong>Exhibit3Design Support System</strong>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const emailOptions: any = {
      from: smtpFrom,
      to: "info@exhibit3design.com",
      subject: "🚨 Critical Support Chat Issue",
      html: htmlContent,
    };

    if (imageAttachment) {
      emailOptions.attachments = [imageAttachment];
    }

    await client.send(emailOptions);
    console.log('Critical issue email sent successfully', imageAttachment ? 'with image attachment' : '');
  } catch (error) {
    console.error('Failed to send critical issue email:', error);
  } finally {
    await client.close();
  }
}

const SECURITY_POLICY = `
CRITICAL SECURITY POLICY - YOU MUST FOLLOW THESE RULES:

1. NEVER share confidential information including:
   - Technical architecture, hosting details, database schemas
   - API keys, credentials, secrets, tokens
   - Internal metrics, vendor pricing, cost-per-token
   - Owner/staff identities, internal contracts
   - Source code, internal roadmaps, unreleased features

2. If user asks for restricted information, politely refuse and say:
   "Sorry — I can't share that. That information is private. I can offer a high-level explanation or public resources instead."

3. DETECT ESCALATION TRIGGERS:
   - Message count > 10 in conversation
   - Keywords: "urgent", "critical", "emergency", "help", "not working", "broken"
   - User frustration or unresolved issues
   
4. When escalation needed, suggest:
   "It seems you need more personalized support. Would you like to connect with our team via WhatsApp? Click here: https://wa.me/447508879096"

5. Only share PUBLIC information about:
   - Subscription plans and pricing
   - Product features and specifications
   - General usage instructions
   - Public FAQs
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, messageCount = 0, hasImage = false } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Get authorization header to check if user is authenticated
    const authHeader = req.headers.get('authorization');
    let userId = null;
    let userContext = '';

    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        userId = user?.id;

        if (userId) {
          // Get user's subscription info
          const { data: subscription } = await supabase
            .from('user_subscriptions')
            .select(`
              *,
              subscription_plans (
                name,
                price,
                file_access_tier,
                initial_ai_tokens,
                video_results,
                max_files
              )
            `)
            .eq('user_id', userId)
            .eq('status', 'active')
            .maybeSingle();

          if (subscription) {
            userContext = `\n\nUSER'S CURRENT SUBSCRIPTION:
- Plan: ${subscription.subscription_plans?.name}
- Price: €${subscription.subscription_plans?.price}/month
- Access Tier: ${subscription.subscription_plans?.file_access_tier}
- Status: ${subscription.status}
- Renewal: ${new Date(subscription.current_period_end).toLocaleDateString()}`;
          }
        }
      } catch (e) {
        console.log('Auth error:', e.message);
      }
    }

    // Fetch public data for context
    const { data: plans } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    const { data: products } = await supabase
      .from('products')
      .select('id, title, price, tags, subscription_tier_required')
      .limit(20);

    // Build knowledge base
    let knowledgeBase = `
AVAILABLE SUBSCRIPTION PLANS:
${plans?.map(p => `
- ${p.name} (€${p.price}/month):
  * File Access: ${p.file_access_tier}
  * Design Files: ${p.max_files}
  * AI Image Edits: ${p.initial_ai_tokens}
  * AI Videos: ${p.video_results}
  * Features: ${JSON.stringify(p.features)}
`).join('\n')}

PRODUCT CATEGORIES:
${products?.map(p => `- ${p.title} (€${p.price}) - Tier: ${p.subscription_tier_required || 'Sample'}`).join('\n')}

KEY FEATURES:
- AI-powered exhibition stand design
- 360° walkthrough generator
- AI image editing and enhancement
- Video generation for exhibitions
- Ready-made design files
- Multiple subscription tiers

WEBSITE SECTIONS:
- Home: Main landing page with AI showcase
- Products: Browse design files and templates
- Pricing: View and compare subscription plans
- AI Samples: See examples of AI-generated content
- Profile: Manage account and subscription
- About: Company information
- FAQ: Common questions
- Contact: Get in touch

SUPPORT INFORMATION:
- Website: exhibit3design.com
- Email: support@exhibit3design.com
- WhatsApp: +447508879096 (for urgent issues)
${userContext}
`;

    // Check if escalation is needed
    const lastMessageContent = messages[messages.length - 1]?.content;
    const lastMessage = (typeof lastMessageContent === 'string' ? lastMessageContent : 
      Array.isArray(lastMessageContent) ? lastMessageContent.find((c: any) => c.type === 'text')?.text || '' : 
      '').toLowerCase();
    
    const isCritical = 
      lastMessage.includes('critical') ||
      lastMessage.includes('emergency') ||
      lastMessage.includes('urgent') ||
      lastMessage.includes('broken') ||
      lastMessage.includes('not working');
    
    const needsEscalation = 
      messageCount > 10 ||
      isCritical ||
      lastMessage.includes('help') ||
      lastMessage.includes('problem') ||
      lastMessage.includes('issue');

    // Send email for critical issues
    if (isCritical && messageCount > 2) {
      try {
        await sendCriticalIssueEmail(messages, userContext);
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
      }
    }

    const systemPrompt = `${SECURITY_POLICY}

You are a helpful customer support assistant for Exhibit3Design, an AI-powered exhibition stand design platform.

${knowledgeBase}

GUIDELINES:
- Be friendly, professional, and helpful
- Answer questions about subscription plans, products, and features
- NEVER share confidential or internal information
- If you don't know something, admit it and suggest contacting support
- Keep responses concise and clear
${needsEscalation ? '\n- IMPORTANT: Suggest WhatsApp escalation since this seems complex or urgent' : ''}

ESCALATION SUGGESTION (use when appropriate):
"It seems you need more personalized support. Would you like to connect with our team via WhatsApp? Click here: https://wa.me/447508879096"`;

    // Call Lovable AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: hasImage ? 'google/gemini-2.5-pro' : 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Service temporarily unavailable.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });

  } catch (error) {
    console.error('Support chat error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
