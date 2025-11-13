import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

function validateName(name: string): boolean {
  return name.trim().length >= 1 && name.trim().length <= 100;
}

function validateSchool(school: string | null | undefined): boolean {
  if (!school) return true; // Optional field
  return school.trim().length <= 200;
}

function validateSource(source: string | null | undefined): boolean {
  if (!source) return true; // Optional field
  return source.trim().length <= 100;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { name, email, school, source } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required.' },
        { status: 400 }
      );
    }

    // Validate field formats and lengths
    if (!validateName(name)) {
      return NextResponse.json(
        { error: 'Name must be between 1 and 100 characters.' },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format.' },
        { status: 400 }
      );
    }

    if (!validateSchool(school)) {
      return NextResponse.json(
        { error: 'Location must be 200 characters or less.' },
        { status: 400 }
      );
    }

    if (!validateSource(source)) {
      return NextResponse.json(
        { error: 'Source must be 100 characters or less.' },
        { status: 400 }
      );
    }

    // Get Supabase credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase credentials not configured');
      return NextResponse.json(
        { error: 'Server configuration error. Please try again later.' },
        { status: 500 }
      );
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Insert into waitlist
    const { error: supabaseError } = await supabase.from('waitlist').insert([
      {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        school: school?.trim() || null,
        source: source?.trim() || null,
      },
    ]);

    if (supabaseError) {
      // Handle duplicate email error
      if (
        supabaseError.message &&
        (supabaseError.message.includes('duplicate key') ||
          supabaseError.message.includes('unique constraint') ||
          supabaseError.code === '23505')
      ) {
        return NextResponse.json(
          { error: 'This email is already registered on the waitlist.' },
          { status: 409 }
        );
      }

      console.error('Supabase error:', supabaseError);
      return NextResponse.json(
        { error: 'Something went wrong. Please try again.' },
        { status: 500 }
      );
    }

    // Success
    return NextResponse.json(
      { success: true, message: 'Successfully joined the waitlist!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

