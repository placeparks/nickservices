import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      service,
      price,
      network,
      txHash,
      customerEmail,
      telegram,
      walletAddress
    } = body

    // Validate required fields
    if (!service || !price || !network || !txHash || !customerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY
    const NICK_EMAIL = process.env.NICK_EMAIL || 'nick@example.com'

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured')
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
    }

    // Prepare email content
    const emailSubject = `🎉 New Order: ${service} - $${price} USDC`

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .detail-row { margin: 15px 0; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #667eea; }
            .label { font-weight: bold; color: #667eea; margin-bottom: 5px; }
            .value { color: #333; word-break: break-all; }
            .highlight { background: #667eea; color: white; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .tx-link { color: #667eea; text-decoration: none; word-break: break-all; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">💰 New Payment Received!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Nick Services Order Notification</p>
            </div>
            
            <div class="content">
              <div class="highlight">
                <h2 style="margin: 0; font-size: 32px;">$${price} USDC</h2>
                <p style="margin: 5px 0 0 0;">Payment Confirmed</p>
              </div>

              <div class="detail-row">
                <div class="label">📦 Service</div>
                <div class="value">${service}</div>
              </div>

              <div class="detail-row">
                <div class="label">🌐 Network</div>
                <div class="value">${network === 'eth' ? 'Ethereum (Sepolia)' : 'Solana (Devnet)'}</div>
              </div>

              <div class="detail-row">
                <div class="label">📧 Customer Email</div>
                <div class="value">${customerEmail}</div>
              </div>

              ${telegram ? `
                <div class="detail-row">
                  <div class="label">💬 Telegram</div>
                  <div class="value">@${telegram}</div>
                </div>
              ` : ''}

              <div class="detail-row">
                <div class="label">👛 Customer Wallet</div>
                <div class="value" style="font-family: monospace; font-size: 12px;">${walletAddress}</div>
              </div>

              <div class="detail-row">
                <div class="label">🔗 Transaction Hash</div>
                <div class="value">
                  ${network === 'eth'
        ? `<a href="https://sepolia.etherscan.io/tx/${txHash}" class="tx-link" target="_blank">${txHash}</a>`
        : `<a href="https://explorer.solana.com/tx/${txHash}?cluster=devnet" class="tx-link" target="_blank">${txHash}</a>`
      }
                </div>
              </div>

              <div class="detail-row">
                <div class="label">⏰ Time</div>
                <div class="value">${new Date().toLocaleString('en-US', {
        dateStyle: 'full',
        timeStyle: 'long'
      })}</div>
              </div>

              <div style="margin-top: 30px; padding: 20px; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
                <p style="margin: 0; color: #856404;">
                  <strong>⚠️ Next Steps:</strong><br>
                  1. Verify the transaction on the blockchain explorer<br>
                  2. Contact the customer at ${customerEmail}${telegram ? ` or @${telegram} on Telegram` : ''}<br>
                  3. Schedule the service delivery
                </p>
              </div>
            </div>

            <div class="footer">
              <p>This is an automated notification from Nick Services</p>
              <p>Transaction processed on ${network === 'eth' ? 'Ethereum Sepolia Testnet' : 'Solana Devnet'}</p>
            </div>
          </div>
        </body>
      </html>
    `

    // Send email using Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Acme <onboarding@resend.dev>', // Resend's test domain - works immediately!
        to: [NICK_EMAIL],
        subject: emailSubject,
        html: emailHtml,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Resend API error:', data)
      return NextResponse.json(
        { error: 'Failed to send email', details: data },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      emailId: data.id
    })

  } catch (error: any) {
    console.error('Email notification error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}
