
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const slackWebhookUrl = Deno.env.get('SLACK_WEBHOOK_URL');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get error data from request
    const { message, source, stack, route, metadata } = await req.json();
    
    console.log("Received error log:", { message, source, route });
    
    if (!slackWebhookUrl) {
      throw new Error("SLACK_WEBHOOK_URL environment variable is not set");
    }

    // Format message for Slack
    const slackPayload = {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "🚨 Error in VoterDash",
            emoji: true
          }
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Error:*\n${message}`
            },
            {
              type: "mrkdwn",
              text: `*Location:*\n${source || 'Unknown'}`
            }
          ]
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Route:*\n${route || 'Unknown'}`
            },
            {
              type: "mrkdwn",
              text: `*Time:*\n${new Date().toISOString()}`
            }
          ]
        }
      ]
    };

    // Add stack trace if available
    if (stack) {
      slackPayload.blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Stack Trace:*\n\`\`\`${stack}\`\`\``
        }
      });
    }

    // Add metadata if available
    if (metadata) {
      slackPayload.blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Additional Info:*\n\`\`\`${JSON.stringify(metadata, null, 2)}\`\`\``
        }
      });
    }

    // Send to Slack
    const response = await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(slackPayload)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to send to Slack: ${error}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error in slack-error-logger function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
