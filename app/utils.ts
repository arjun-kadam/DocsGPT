export async function createChat(
  fileKey: string
): Promise<'error' | 'success'> {
  const res = await fetch(process.env.NEXT_PUBLIC_URL + '/api/create-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileKey }),
  })

  const data = await res.json()
  if (data.error) throw new Error('Error creating chat')

  return data.chatId
}
