
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
    
    // If no webhook URL is set, log to console but return success
    // This prevents errors from propagating to the client
    if (!slackWebhookUrl) {
      console.warn("SLACK_WEBHOOK_URL environment variable is not set. Logging to console only.");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Error logged to console (SLACK_WEBHOOK_URL not configured)" 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Format message for Slack
    const slackPayload = {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: source.includes("Data Debugging") ? "📊 Data Issue in VoterDash" : "🚨 Error in VoterDash",
            emoji: true
          }
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Issue:*\n${message}`
            },
            {
              type: "mrkdwn",
              text: `*Source:*\n${source || 'Unknown'}`
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

    // Special handling for debug history if it exists
    if (metadata && metadata.debugHistory) {
      slackPayload.blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Debug History:*\n${metadata.debugHistory.map((item: string) => `• ${item}`).join('\n')}`
        }
      });
      
      // Remove debug history from metadata to avoid duplication
      const { debugHistory, ...restMetadata } = metadata;
      metadata = restMetadata;
    }

    // Add metadata if available
    if (metadata && Object.keys(metadata).length > 0) {
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
    // Still return a 200 response to prevent client errors
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
