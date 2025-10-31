# Doduo User Guide

Welcome to Doduo - your private, decentralized messaging app powered by Nostr!

## Getting Started

### 1. Login with Nostr

To use Doduo, you'll need a Nostr identity. You can:

- **Use a Browser Extension** (Recommended):
  - Install [nos2x](https://github.com/fiatjaf/nos2x) (Chrome/Brave)
  - Install [Alby](https://getalby.com/) (Chrome/Firefox)
  - Install [Flamingo](https://www.getflamingo.org/) (Chrome)

- **Create a New Account**:
  - Click "Sign Up" on the landing page
  - Your keys will be stored in your browser (keep them safe!)

### 2. Start a Conversation

Once logged in:

1. Click the **+** button in the conversation list
2. Enter a Nostr public key in one of these formats:
   - `npub1...` (Nostr public key)
   - `nprofile1...` (Nostr profile with relay hints)
   - Hex public key (64 characters)
3. Click "Start Chat"

### 3. Send Messages

- Type your message in the text box at the bottom
- Press **Enter** or click **Send**
- Your message is encrypted end-to-end automatically

### 4. Share Files

1. Click the **📎 paperclip** icon
2. Select an image or file
3. The file is uploaded to a Blossom server and shared encrypted

## Features Explained

### Active vs Requests

Messages are organized into two tabs:

- **Active**: Conversations where you've sent at least one message
- **Requests**: New conversations from people you haven't replied to yet

This helps you manage unsolicited messages while staying connected with your contacts.

### Privacy Features

Doduo uses **NIP-17** for maximum privacy:

- **End-to-End Encryption**: Only you and the recipient can read messages
- **Metadata Protection**: Your identity is hidden from relays using "gift wrapping"
- **Timestamp Randomization**: Message times are randomized to prevent timing analysis
- **Local Encryption**: Messages stored on your device are encrypted

### Settings

Click the **⚙️ gear icon** in the header to:

- Toggle between light and dark mode
- View messaging status and relay info
- Clear local message cache

## Tips & Tricks

### Keyboard Shortcuts

- **Enter**: Send message
- **Shift + Enter**: New line in message

### Finding People

To find someone's Nostr public key:

1. Ask them to share their `npub` address
2. Look for their profile on Nostr clients like:
   - [primal.net](https://primal.net)
   - [snort.social](https://snort.social)
   - [iris.to](https://iris.to)

### Relay Selection

Doduo connects to Nostr relays to send and receive messages. You can:

- Use the default relay (Ditto)
- Switch relays in the app settings
- Add custom relays for better connectivity

## Troubleshooting

### Messages Not Sending

- Check your internet connection
- Try switching to a different relay
- Make sure the recipient's public key is correct

### Messages Not Loading

- Click the info icon (ⓘ) to view loading status
- Try clearing cache in Settings → Status & Info
- Check if you're connected to a relay

### Can't Login

- Make sure your browser extension is unlocked
- Try refreshing the page
- Check browser console for errors

## Security Best Practices

1. **Backup Your Keys**: Save your private key (nsec) in a secure location
2. **Don't Share Private Keys**: Never share your `nsec` with anyone
3. **Use Hardware Keys**: For maximum security, use hardware wallets that support NIP-07
4. **Verify Identities**: Always verify you're messaging the right person

## Support & Feedback

Doduo is open source and built on open protocols:

- **Report Issues**: [GitHub Issues](https://github.com/yourusername/doduo/issues)
- **Learn About Nostr**: [nostr.how](https://nostr.how)
- **NIP-17 Spec**: [NIP-17 Documentation](https://github.com/nostr-protocol/nips/blob/master/17.md)

## Privacy Policy

Doduo is fully decentralized:

- **No Central Server**: Messages go directly to Nostr relays
- **No Data Collection**: We don't collect or store any user data
- **No Tracking**: No analytics, no cookies, no tracking
- **Your Keys, Your Data**: You control your identity and messages

---

Built with ❤️ using the Nostr protocol
