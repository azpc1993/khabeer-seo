import { NextResponse } from 'next/server';

// TODO: Implement signature verification if Salla provides a mechanism.
// For now, this route accepts POST requests and logs the event.

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { event, merchant } = body;

    console.log(`Received Salla Webhook: ${event} for merchant: ${merchant}`);

    // Handle different event types
    switch (event) {
      case 'app.store.authorize':
        // Handle authorization
        break;
      case 'app.installed':
        // Handle installation
        break;
      case 'app.uninstalled':
        // Handle uninstallation
        break;
      case 'app.subscription.started':
        // Handle subscription start
        break;
      case 'app.subscription.canceled':
        // Handle subscription cancel
        break;
      case 'app.subscription.expired':
        // Handle subscription expire
        break;
      case 'app.subscription.renewed':
        // Handle subscription renew
        break;
      case 'app.trial.started':
        // Handle trial start
        break;
      case 'app.trial.expired':
        // Handle trial expire
        break;
      case 'app.trial.canceled':
        // Handle trial cancel
        break;
      case 'app.feedback.created':
        // Handle feedback
        break;
      case 'app.settings.updated':
        // Handle settings update
        break;
      case 'app.updated':
        // Handle app update
        break;
      default:
        console.warn(`Unhandled Salla event: ${event}`);
    }

    // Return 200 OK to acknowledge receipt
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Error processing Salla webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
