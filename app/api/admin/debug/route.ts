import { NextResponse } from 'next/server';

export async function GET() {
  const pin = process.env.ADMIN_PIN ?? '';
  const key = process.env.ADMIN_SECRET_KEY ?? '';
  return NextResponse.json({
    pin_loaded: pin.length > 0,
    pin_value:  pin || 'EMPTY',
    key_loaded: key.length > 0,
    key_length: key.length,
  });
}
