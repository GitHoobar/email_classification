import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(request) {
  const { session, numEmails } = request.query;

  return new Response(null);
}

export async function POST(request) {
  const { emailsToClassify, apiKey } = await request.json();

  return new Response(null);
}