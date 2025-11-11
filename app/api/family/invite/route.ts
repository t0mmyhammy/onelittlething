import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    // Get user's family
    const { data: familyMember } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', user.id)
      .single();

    if (!familyMember) {
      return NextResponse.json({ error: 'No family found' }, { status: 404 });
    }

    // Check if user already in family
    const { data: existingUser } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      const { data: existingMember } = await supabase
        .from('family_members')
        .select('id')
        .eq('user_id', existingUser.id)
        .eq('family_id', familyMember.family_id)
        .single();

      if (existingMember) {
        return NextResponse.json({ error: 'User already in family' }, { status: 400 });
      }
    }

    // Generate unique token
    const token = crypto.randomUUID();

    // Create invite
    const { error: inviteError } = await supabase
      .from('family_invites')
      .insert({
        family_id: familyMember.family_id,
        invited_by: user.id,
        email: email.toLowerCase(),
        token,
      });

    if (inviteError) {
      console.error('Error creating invite:', inviteError);
      return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 });
    }

    // Send email
    const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/invite/${token}`;

    const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'A family member';

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return NextResponse.json({
        success: true,
        warning: 'Invite created but email not sent (email service not configured)'
      });
    }

    try {
      const { data: emailData, error: emailError } = await resend.emails.send({
        from: 'OneLittleThing <invites@littlevictors.com>',
        to: email,
        subject: `${userName} invited you to join their family on OneLittleThing`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #374151; font-size: 24px;">You're invited!</h1>
            <p style="color: #6B7280; font-size: 16px; line-height: 1.5;">
              ${userName} has invited you to join their family on OneLittleThing,
              where you can capture and share everyday moments together.
            </p>
            <a href="${inviteUrl}"
               style="display: inline-block; background: #D8A7A0; color: white; padding: 12px 24px;
                      text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 500;">
              Accept Invitation
            </a>
            <p style="color: #9CA3AF; font-size: 14px;">
              This invitation expires in 7 days. If you didn't expect this invitation, you can ignore this email.
            </p>
          </div>
        `,
      });

      if (emailError) {
        console.error('Resend error:', emailError);
        return NextResponse.json({
          success: true,
          warning: 'Invite created but email failed to send. Please share the invite link manually.'
        });
      }

      console.log('Email sent successfully:', emailData);
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      return NextResponse.json({
        success: true,
        warning: 'Invite created but email failed to send. Please share the invite link manually.'
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in invite route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
