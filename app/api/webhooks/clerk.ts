import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { createServiceSupabaseClient } from '@/app/lib/supabase'
import { WebhookEvent } from '@clerk/nextjs/server'

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const body = await req.text()

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '')

  let evt: WebhookEvent
  // Verify the payload
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occurred', {
      status: 400,
    })
  }

  try {
    const supabase = createServiceSupabaseClient()

    // Handle user.created event
    if (evt.type === 'user.created') {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data

      const email = email_addresses[0]?.email_address || ''
      const name = [first_name, last_name].filter(Boolean).join(' ') || email

      await supabase.from('users').insert({
        id: id,
        clerk_id: id,
        email,
        name,
        avatar_url: image_url,
      })

      console.log(`✓ User created: ${id}`)
    }

    // Handle user.updated event
    if (evt.type === 'user.updated') {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data

      const email = email_addresses[0]?.email_address || ''
      const name = [first_name, last_name].filter(Boolean).join(' ') || email

      await supabase
        .from('users')
        .update({
          email,
          name,
          avatar_url: image_url,
        })
        .eq('clerk_id', id)

      console.log(`✓ User updated: ${id}`)
    }

    return new Response('Webhook processed', { status: 200 })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response('Error processing webhook', { status: 500 })
  }
}
