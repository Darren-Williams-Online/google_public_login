# Push Notification Payload Fields

You can use the following fields in your push notification payload. All fields are optional except `title` (required by the Notification API).

## JSON Example
```json
{
  "title": "Notification Title",           // string, required
  "body": "Main message text",             // string
  "icon": "https://example.com/icon.png",  // string (URL)
  "image": "https://example.com/image.jpg",// string (URL)
  "badge": "https://example.com/badge.png",// string (URL)
  "tag": "unique-tag-id",                  // string
  "actions": [                              // array of action objects
    {
      "action": "open_url",                // string (action id)
      "title": "Open Link",                // string (button text)
      "icon": "https://example.com/btn.png"// string (URL, optional)
    }
  ],
  "vibrate": [200, 100, 200],               // array of numbers (pattern)
  "timestamp": 1620000000000,               // number (ms since epoch)
  "requireInteraction": true,               // boolean
  "renotify": false,                        // boolean
  "silent": false,                          // boolean
  "url": "https://example.com/page",       // string (custom, for click)
  "data": {                                 // object (custom data)
    "foo": "bar"
  }
}
```

## Field Descriptions
- `title`: Notification title (bold, required)
- `body`: Main message text
- `icon`: Small icon (top left)
- `image`: Large image (below body, some browsers)
- `badge`: Monochrome icon for status bar (Android)
- `tag`: Used to replace/stack notifications
- `actions`: Array of action buttons (see above)
- `vibrate`: Vibration pattern (mobile)
- `timestamp`: Display time
- `requireInteraction`: Stays until user interacts
- `renotify`: Alerts again if replaced
- `silent`: No sound/vibration
- `url`: Custom link to open on click (handled in service worker)
- `data`: Any custom data (not shown, available in click handler)

> Not all browsers support all fields. Most visible: title, body, icon, image, actions.
