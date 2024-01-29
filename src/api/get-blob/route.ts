import { head } from '@vercel/blob';
 
export const runtime = 'edge';
 
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const blobUrl = searchParams.get('https://dised9ewbod3xp2m.public.blob.vercel-storage.com/articles/blob-rodEBNw9iyDYZ9rZBVrNLnKdyoC7mS.txt');
  const blobDetails = await head(blobUrl!);
 
  return Response.json(blobDetails);
}
