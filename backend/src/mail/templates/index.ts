export interface EmailTemplate {
  subject: string;
  html: string;
}

export const templates = {
  newsletterConfirmation: (email: string): EmailTemplate => ({
    subject: 'Welcome to AfriTix Newsletter!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to AfriTix Newsletter</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #4f46e5; padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0;">AfriTix</h1>
            </div>
            <div style="background-color: #fff; padding: 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #4f46e5;">Thanks for Subscribing!</h2>
              <p>Hi there,</p>
              <p>Welcome to the AfriTix newsletter! You're now part of our community and will receive updates about:</p>
              <ul style="padding-left: 20px;">
                <li>Upcoming events in your area</li>
                <li>Early bird ticket offers</li>
                <li>Exclusive promotions and discounts</li>
                <li>Artist announcements and event highlights</li>
              </ul>
              <p>Stay tuned for exciting updates!</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="color: #666; font-size: 12px;">
                This email was sent to ${email}. If you didn't subscribe to our newsletter, you can safely ignore this email.
              </p>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  welcome: (data: { name: string }): EmailTemplate => ({
    subject: 'Welcome to AfriTix!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to AfriTix</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #4f46e5; padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0;">Welcome to AfriTix!</h1>
            </div>
            <div style="background-color: #fff; padding: 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #4f46e5;">Hello ${data.name}!</h2>
              <p>Thank you for joining AfriTix! We're excited to have you as part of our community.</p>
              <p>With your new account, you can:</p>
              <ul style="padding-left: 20px;">
                <li>Discover and book amazing events across Africa</li>
                <li>Get early access to ticket sales</li>
                <li>Manage your bookings in one place</li>
                <li>Receive personalized event recommendations</li>
              </ul>
              <div style="margin: 30px 0; text-align: center;">
                <a href="https://afritix.com/events" 
                   style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Explore Events
                </a>
              </div>
              <p>Need help getting started? Here are some quick links:</p>
              <ul style="padding-left: 20px;">
                <li><a href="https://afritix.com/profile" style="color: #4f46e5;">Complete your profile</a></li>
                <li><a href="https://afritix.com/categories" style="color: #4f46e5;">Browse event categories</a></li>
                <li><a href="https://afritix.com/help" style="color: #4f46e5;">Visit our help center</a></li>
              </ul>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="color: #666; font-size: 12px;">
                This email was sent by AfriTix. If you did not create this account, please contact our support team.
              </p>
            </div>
          </div>
        </body>
      </html>
    `
  })
};