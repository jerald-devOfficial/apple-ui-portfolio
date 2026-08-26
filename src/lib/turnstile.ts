type TurnstileVerifyResponse = {
  success: boolean
  'error-codes'?: string[]
}

export const verifyTurnstileToken = async (
  token: string,
  remoteip?: string
): Promise<{ success: boolean; error?: string }> => {
  const secret = process.env.TURNSTILE_SECRET_KEY

  if (!secret) {
    console.warn(
      'contact: TURNSTILE_SECRET_KEY is not set — skipping verification'
    )
    return { success: true }
  }

  if (!token) {
    return { success: false, error: 'Security verification is required.' }
  }

  try {
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret,
          response: token,
          remoteip
        })
      }
    )

    const data = (await response.json()) as TurnstileVerifyResponse

    if (!data.success) {
      console.error(
        'contact: turnstile verification failed',
        data['error-codes']
      )
      return {
        success: false,
        error: 'Security verification failed. Please try again.'
      }
    }

    return { success: true }
  } catch (error) {
    console.error('contact: turnstile verification error', error)
    return {
      success: false,
      error: 'Security verification could not be completed. Please try again.'
    }
  }
}
