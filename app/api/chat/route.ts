import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { getParentingStyle, buildStylePrompt, CustomParentingStyle, ParentingStyle } from '@/lib/parentingStyles';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages, childContext, selectedStyle, customStyles, conversationId } = await req.json();

    // Verify user is authenticated
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Get user's family
    const { data: familyMember } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', user.id)
      .single();

    if (!familyMember) {
      return new Response('No family found', { status: 404 });
    }

    // Handle conversation persistence
    let currentConversationId = conversationId;

    // If no conversation ID provided, create a new conversation
    if (!currentConversationId) {
      const { data: newConversation, error: convError } = await supabase
        .from('chat_conversations')
        .insert({
          user_id: user.id,
          family_id: familyMember.family_id,
          parenting_style: selectedStyle,
        })
        .select('id')
        .single();

      if (convError || !newConversation) {
        console.error('Error creating conversation:', convError);
      } else {
        currentConversationId = newConversation.id;
      }
    }

    // Save user message to database if we have a conversation ID
    if (currentConversationId && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'user') {
        await supabase.from('chat_messages').insert({
          conversation_id: currentConversationId,
          role: 'user',
          content: lastMessage.content,
        });
      }
    }

    // Get the selected parenting style
    let style: ParentingStyle | CustomParentingStyle | null = getParentingStyle(selectedStyle || 'love-and-logic');

    // If it's a custom style, find it in customStyles
    if (!style && customStyles) {
      const customStyle = customStyles.find((s: any) => s.id === selectedStyle);
      if (customStyle) {
        style = { ...customStyle, isCustom: true } as CustomParentingStyle;
      }
    }

    // Fallback to Love & Logic if style not found
    if (!style) {
      style = getParentingStyle('love-and-logic')!;
    }

    // Build system prompt with selected parenting style
    const systemPrompt = buildSystemPrompt(style, childContext);

    // Call OpenAI API with streaming
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      stream: true,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    // Convert the response to a streaming text response
    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error: any) {
    console.error('Chat API error:', error);
    return new Response(error.message || 'Internal server error', {
      status: 500,
    });
  }
}

function buildSystemPrompt(
  style: ParentingStyle | CustomParentingStyle,
  childContext?: {
    children: Array<{ name: string; age?: number; birthdate?: string }>;
  }
): string {
  let prompt = `You are a warm, empathetic parenting coach. Your role is to help parents navigate challenging situations with their children.`;

  // Add the selected parenting style's approach
  prompt += `\n\n${buildStylePrompt(style)}`;

  prompt += `\n\n## Your Approach:

- Ask clarifying questions to understand the situation fully
- Suggest specific techniques from the chosen parenting approach
- Use empathetic language and avoid judgment
- Offer practical, actionable advice
- Remind parents that mistakes are learning opportunities
- Keep responses BRIEF and digestible - aim for 4-6 sentences total
- Use bullet points or short paragraphs when listing techniques
- Stay consistent with the parenting philosophy outlined above

## Important Guidelines:

- Never provide medical, legal, or mental health advice
- If a situation seems serious (abuse, severe mental health concerns), gently encourage seeking professional help
- Focus on everyday parenting challenges and behavior management
- Celebrate small wins and progress`;

  // Add child context if provided
  if (childContext && childContext.children && childContext.children.length > 0) {
    prompt += `\n\n## Parent's Children:\n\n`;
    childContext.children.forEach((child) => {
      let childInfo = `- ${child.name}`;
      if (child.age !== undefined) {
        childInfo += ` (${child.age} years old)`;
      } else if (child.birthdate) {
        childInfo += ` (birthdate: ${child.birthdate})`;
      }
      prompt += childInfo + '\n';
    });
    prompt += `\nWhen relevant, tailor your advice to the ages and developmental stages of these specific children.`;
  }

  return prompt;
}
