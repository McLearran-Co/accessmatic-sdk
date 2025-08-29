# AccessMatic SDK

Government-resilient client SDK for automatic PDF accessibility processing. Transform any website's PDFs into WCAG 2.1/2.2 compliant accessible documents with a single script tag.

## 🚀 Quick Start

Add this script tag to your website's `<head>` section:

```html
<script 
  src="https://cdn.accessmatic.us/accessmatic.min.js"
  data-accessmatic-key="your-api-key-here"
  data-debug="true">
</script>
```

That's it! All PDF links on your website will automatically become accessible.

## ✨ Features

- **🔍 Automatic PDF Discovery** - Finds all PDF links on your website automatically
- **🏛️ Government Firewall Resilient** - Works behind strict security policies and blocked networks
- **⚡ Real-time Processing** - Converts PDFs to accessible HTML in 30-60 seconds
- **♿ WCAG 2.1/2.2 Compliance** - Meets accessibility standards automatically
- **🔄 Zero Workflow Disruption** - No training or process changes required
- **📱 Mobile Friendly** - Responsive design for all devices
- **🎨 Customizable UI** - Branded modals and themes available

## 🏛️ Perfect for Government

- **City & County Websites** - Budget documents, meeting minutes, reports
- **School Districts** - Policies, handbooks, board meeting documents  
- **Health Departments** - Public health reports, regulations
- **Courts & Legal** - Forms, procedures, public records
- **Planning & Zoning** - Applications, maps, ordinances

## 📋 Configuration Options

| Attribute | Description | Default |
|-----------|-------------|---------|
| `data-accessmatic-key` | Your API key (required) | - |
| `data-api-url` | API endpoint URL | `https://api.accessmatic.us/api/v1` |
| `data-debug` | Enable debug logging | `false` |
| `data-auto-discover` | Automatically find PDF links | `true` |
| `data-show-branding` | Show "Powered by AccessMatic" | `true` |
| `data-theme` | UI theme (`default`, `government`, `minimal`) | `default` |

## 🔧 Integration Examples

### Basic Integration
```html
<script 
  src="https://cdn.accessmatic.us/accessmatic.min.js"
  data-accessmatic-key="ak_live_123..."
  data-auto-discover="true">
</script>
```

### Government Theme
```html
<script 
  src="https://cdn.accessmatic.us/accessmatic.min.js"
  data-accessmatic-key="ak_live_123..."
  data-theme="government"
  data-show-branding="false">
</script>
```

### WordPress Integration
```php
function accessmatic_init() {
    $api_key = get_option('accessmatic_api_key');
    ?>
    <script>
        window.AccessMaticConfig = {
            apiKey: '<?php echo esc_js($api_key); ?>',
            autoDiscover: true,
            theme: 'government'
        };
    </script>
    <script src="https://cdn.accessmatic.us/accessmatic.min.js" async></script>
    <?php
}
add_action('wp_head', 'accessmatic_init');
```

### Manual Processing
```html
<script 
  src="https://cdn.accessmatic.us/accessmatic.min.js"
  data-accessmatic-key="ak_live_123..."
  data-auto-discover="false">
</script>

<script>
// Process specific URLs manually
AccessMatic.processURL('https://example.gov/budget.pdf');

// Get processing statistics
console.log('Processed:', AccessMatic.getProcessedCount());
console.log('Discovered:', AccessMatic.getDiscoveredCount());
</script>
```

## 🌐 Browser Support

- Chrome/Edge 88+
- Firefox 78+  
- Safari 14+
- Government-secured environments
- Works with strict CSP policies
- Compatible with firewall restrictions

## 🏗️ How It Works

1. **Discovery Phase**
   - SDK scans your website for PDF links using multiple strategies
   - Adds accessibility indicators (♿) to discovered PDFs
   - Sets up click interception

2. **Processing Phase** (when user clicks PDF)
   - Shows professional processing modal
   - Sends PDF to AccessMatic AI for processing
   - Extracts text, enhances with AI, validates WCAG compliance

3. **Display Phase**
   - Shows accessible HTML version in modal
   - Provides print and download options
   - Maintains original PDF access

## 🔒 Government Security Features

### Network Resilience
- **Automatic Fallback**: Works even when AI processing is blocked
- **Local Processing**: Basic accessibility features without network calls
- **Proxy Support**: Can route through your existing infrastructure
- **CSP Compatible**: Works with Content Security Policies

### Privacy & Security
- **No Data Storage**: Documents processed in real-time, not stored
- **HTTPS Only**: All communications encrypted
- **API Key Authentication**: Secure access control
- **Audit Logging**: Full processing logs available

## 🚀 Deployment

### CDN (Recommended)
```html
<script src="https://cdn.accessmatic.us/accessmatic.min.js"></script>
```

### Self-Hosted
1. Download the SDK files
2. Host on your own CDN/server
3. Update the script src to your URL

```bash
# Build from source
npm install
npm run build

# Files will be in dist/
# - accessmatic.js (development)
# - accessmatic.min.js (production)
# - index.html (CDN landing page)
```

## 🧪 Testing

Test the SDK on your website:

```bash
# Start local server
npm run serve

# Build and watch for changes
npm run build:watch

# Run tests
npm test
```

## 📊 Performance

- **SDK Size**: ~15KB minified + gzipped
- **Load Time**: <100ms on modern browsers  
- **Processing Time**: 30-60 seconds per PDF
- **Memory Usage**: <5MB per processed document
- **Cache Friendly**: Processed documents cached locally

## 🆘 Troubleshooting

### Common Issues

**SDK not loading:**
```html
<!-- Check your API key -->
<script data-accessmatic-key="ak_live_..." src="..."></script>

<!-- Enable debug mode -->
<script data-debug="true" src="..."></script>
```

**No PDFs discovered:**
```javascript
// Manual discovery
AccessMatic.discoverNewPDFs().then(count => {
    console.log('Found', count, 'PDFs');
});
```

**Network blocked (government firewalls):**
The SDK automatically detects network restrictions and provides fallback functionality.

### Debug Mode
Enable debug mode to see detailed logs:

```html
<script data-debug="true" src="https://cdn.accessmatic.us/accessmatic.min.js"></script>
```

Check browser console for logs prefixed with `[AccessMatic]`.

## 📞 Support

- **Documentation**: https://docs.accessmatic.us
- **Support Email**: support@accessmatic.us  
- **Status Page**: https://status.accessmatic.us
- **GitHub Issues**: https://github.com/accessmatic/sdk/issues

## 🤝 Government Compliance

AccessMatic helps organizations meet:

- **Section 508** (US Federal)
- **ADA Title II** (State & Local)
- **WCAG 2.1/2.2 AA** (International)
- **EN 301 549** (European)

## 💰 Pricing

Perfect for government budgets:

- **Small Government**: $99/month (500 PDF accesses)
- **Medium Government**: $299/month (2,000 PDF accesses)  
- **Large Government**: $599/month (5,000 PDF accesses)
- **Enterprise**: Custom pricing for unlimited access

## 🔗 Links

- **Website**: https://accessmatic.us
- **Dashboard**: https://app.accessmatic.us
- **API Documentation**: https://docs.accessmatic.us/api
- **Status**: https://status.accessmatic.us

---

**Built for Government. Designed for Accessibility. Optimized for Compliance.**

*Making every PDF accessible, one click at a time.* ♿
