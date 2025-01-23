// lib/services/emailService.ts
interface SendEmailParams {
    to: string
    firstName: string
    accessCode: string
    isExistingUser?: boolean
  }
  
  export const emailService = {
    async sendAccessCode({ to, firstName, accessCode }: SendEmailParams) {
      const url = 'https://api.brevo.com/v3/smtp/email'
      
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': process.env.BREVO_API_KEY!,
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            sender: {
              email: process.env.BREVO_SENDER_EMAIL,
              name: 'njiva'
            },
            to: [{ email: to }],
            subject: `Welcome to njiva ${firstName}! - Your Access Code`,
            htmlContent: `
              <h1>Welcome to njiva, ${firstName}!</h1>
              <p>Your access code is: <strong>${accessCode}</strong></p>
              <p>This code will expire in 15 minutes.</p>
              <p>Enter this code to get started organizing your thoughts.</p>
              <p>stay awesome,<br>the njiva team</p>
              <p><em>P.S. Got questions? We’ve got answers: njiva.app@gmail.com.</em></p>
            `
          })
        })
  
        if (!response.ok) {
          throw new Error('Failed to send email')
        }
  
        return { success: true }
      } catch (error) {
        console.error('Email service error:', error)
        return { success: false, error: 'Failed to send email' }
      }
    }
  }