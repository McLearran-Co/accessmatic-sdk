#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');
const chokidar = require('chokidar');

// Configuration
const config = {
    input: 'src/accessmatic.js',
    output: {
        dev: 'dist/accessmatic.js',
        prod: 'dist/accessmatic.min.js'
    },
    banner: `/**
 * AccessMatic SDK v1.0.0
 * Government-resilient PDF accessibility processing
 * https://accessmatic.us
 * 
 * Built on ${new Date().toISOString()}
 */
`,
    terserOptions: {
        compress: {
            drop_console: false, // Keep console.log for debug mode
            drop_debugger: true,
            passes: 2
        },
        mangle: {
            reserved: ['AccessMatic', 'AccessMaticSDK'] // Preserve main class names
        },
        format: {
            comments: /^!/
        }
    }
};

// Ensure dist directory exists
function ensureDistDir() {
    const distDir = path.dirname(config.output.dev);
    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
        console.log(`📁 Created directory: ${distDir}`);
    }
}

// Read source file
function readSource() {
    try {
        const source = fs.readFileSync(config.input, 'utf8');
        return source;
    } catch (error) {
        console.error(`❌ Error reading source file: ${error.message}`);
        process.exit(1);
    }
}

// Build development version (unminified)
async function buildDev() {
    console.log('🔨 Building development version...');
    
    const source = readSource();
    const output = config.banner + source;
    
    fs.writeFileSync(config.output.dev, output);
    console.log(`✅ Development build complete: ${config.output.dev}`);
    
    // Calculate file size
    const stats = fs.statSync(config.output.dev);
    console.log(`📊 Size: ${(stats.size / 1024).toFixed(2)} KB`);
}

// Build production version (minified)
async function buildProd() {
    console.log('🔨 Building production version...');
    
    const source = readSource();
    
    try {
        const result = await minify(source, config.terserOptions);
        
        if (result.error) {
            throw result.error;
        }
        
        const output = config.banner + result.code;
        
        fs.writeFileSync(config.output.prod, output);
        console.log(`✅ Production build complete: ${config.output.prod}`);
        
        // Calculate file sizes
        const originalStats = fs.statSync(config.input);
        const minifiedStats = fs.statSync(config.output.prod);
        const reduction = ((originalStats.size - minifiedStats.size) / originalStats.size * 100).toFixed(1);
        
        console.log(`📊 Original: ${(originalStats.size / 1024).toFixed(2)} KB`);
        console.log(`📊 Minified: ${(minifiedStats.size / 1024).toFixed(2)} KB`);
        console.log(`📊 Reduction: ${reduction}%`);
        
    } catch (error) {
        console.error(`❌ Minification error: ${error.message}`);
        process.exit(1);
    }
}

// Generate integrity hashes for CDN
function generateIntegrity() {
    console.log('🔐 Generating integrity hashes...');
    
    const crypto = require('crypto');
    
    [config.output.dev, config.output.prod].forEach(file => {
        if (fs.existsSync(file)) {
            const content = fs.readFileSync(file);
            const hash = crypto.createHash('sha384').update(content).digest('base64');
            const integrityFile = `${file}.integrity`;
            
            fs.writeFileSync(integrityFile, `sha384-${hash}`);
            console.log(`🔐 ${path.basename(file)}: sha384-${hash}`);
        }
    });
}

// Create CDN index.html for hosting
function createCDNIndex() {
    console.log('📄 Creating CDN index.html...');
    
    const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AccessMatic SDK</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
        .header { text-align: center; padding: 40px 0; border-bottom: 2px solid #007cba; margin-bottom: 40px; }
        .logo { font-size: 2.5em; color: #007cba; font-weight: bold; }
        .tagline { color: #666; margin-top: 10px; }
        .file-list { background: #f8f9fa; padding: 30px; border-radius: 8px; margin: 30px 0; }
        .file-item { display: flex; justify-content: between; align-items: center; padding: 12px 0; border-bottom: 1px solid #dee2e6; }
        .file-item:last-child { border-bottom: none; }
        .file-name { font-weight: 600; color: #007cba; }
        .file-size { color: #6c757d; font-size: 0.9em; }
        .integration-example { background: #f1f3f4; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .integration-example code { background: #fff; padding: 15px; border-radius: 4px; display: block; overflow-x: auto; }
        a { color: #007cba; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">AccessMatic SDK</div>
        <div class="tagline">Government-resilient PDF accessibility processing</div>
    </div>
    
    <h2>Quick Integration</h2>
    <p>Add this script tag to your website's <code>&lt;head&gt;</code> section:</p>
    
    <div class="integration-example">
        <code>&lt;script 
  src="https://cdn.accessmatic.us/accessmatic.min.js"
  data-accessmatic-key="your-api-key-here"
  data-debug="false"&gt;
&lt;/script&gt;</code>
    </div>
    
    <h2>Available Files</h2>
    <div class="file-list">
        <div class="file-item">
            <div>
                <div class="file-name"><a href="accessmatic.min.js">accessmatic.min.js</a></div>
                <div>Production version (minified)</div>
            </div>
            <div class="file-size" id="minified-size">Loading...</div>
        </div>
        <div class="file-item">
            <div>
                <div class="file-name"><a href="accessmatic.js">accessmatic.js</a></div>
                <div>Development version (unminified)</div>
            </div>
            <div class="file-size" id="dev-size">Loading...</div>
        </div>
    </div>
    
    <h2>Configuration Options</h2>
    <table style="width: 100%; border-collapse: collapse;">
        <thead>
            <tr style="background: #f8f9fa;">
                <th style="text-align: left; padding: 12px; border: 1px solid #dee2e6;">Attribute</th>
                <th style="text-align: left; padding: 12px; border: 1px solid #dee2e6;">Description</th>
                <th style="text-align: left; padding: 12px; border: 1px solid #dee2e6;">Default</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="padding: 12px; border: 1px solid #dee2e6;"><code>data-accessmatic-key</code></td>
                <td style="padding: 12px; border: 1px solid #dee2e6;">Your API key (required)</td>
                <td style="padding: 12px; border: 1px solid #dee2e6;">-</td>
            </tr>
            <tr>
                <td style="padding: 12px; border: 1px solid #dee2e6;"><code>data-api-url</code></td>
                <td style="padding: 12px; border: 1px solid #dee2e6;">API endpoint URL</td>
                <td style="padding: 12px; border: 1px solid #dee2e6;">https://api.accessmatic.us/api/v1</td>
            </tr>
            <tr>
                <td style="padding: 12px; border: 1px solid #dee2e6;"><code>data-debug</code></td>
                <td style="padding: 12px; border: 1px solid #dee2e6;">Enable debug logging</td>
                <td style="padding: 12px; border: 1px solid #dee2e6;">false</td>
            </tr>
            <tr>
                <td style="padding: 12px; border: 1px solid #dee2e6;"><code>data-auto-discover</code></td>
                <td style="padding: 12px; border: 1px solid #dee2e6;">Automatically find PDF links</td>
                <td style="padding: 12px; border: 1px solid #dee2e6;">true</td>
            </tr>
            <tr>
                <td style="padding: 12px; border: 1px solid #dee2e6;"><code>data-show-branding</code></td>
                <td style="padding: 12px; border: 1px solid #dee2e6;">Show "Powered by AccessMatic"</td>
                <td style="padding: 12px; border: 1px solid #dee2e6;">true</td>
            </tr>
        </tbody>
    </table>
    
    <h2>Browser Support</h2>
    <ul>
        <li>Chrome/Edge 88+</li>
        <li>Firefox 78+</li>
        <li>Safari 14+</li>
        <li>Government-secured environments</li>
    </ul>
    
    <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d;">
        <p>Powered by <a href="https://accessmatic.us">AccessMatic</a> - Making documents accessible for everyone</p>
    </div>
    
    <script>
        // Display file sizes dynamically
        fetch('accessmatic.min.js')
            .then(response => response.blob())
            .then(blob => {
                document.getElementById('minified-size').textContent = (blob.size / 1024).toFixed(2) + ' KB';
            });
            
        fetch('accessmatic.js')
            .then(response => response.blob())
            .then(blob => {
                document.getElementById('dev-size').textContent = (blob.size / 1024).toFixed(2) + ' KB';
            });
    </script>
</body>
</html>`;
    
    fs.writeFileSync('dist/index.html', indexHtml);
    console.log('✅ CDN index.html created');
}

// Watch mode
function startWatch() {
    console.log('👀 Starting watch mode...');
    console.log(`Watching: ${config.input}`);
    
    const watcher = chokidar.watch(config.input, {
        ignoreInitial: false
    });
    
    watcher.on('change', async () => {
        console.log('🔄 Source file changed, rebuilding...');
        await build();
    });
    
    console.log('Press Ctrl+C to stop watching');
}

// Main build function
async function build() {
    const startTime = Date.now();
    
    ensureDistDir();
    await buildDev();
    await buildProd();
    generateIntegrity();
    createCDNIndex();
    
    const duration = Date.now() - startTime;
    console.log(`🎉 Build complete in ${duration}ms`);
}

// CLI handling
async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--watch')) {
        startWatch();
    } else if (args.includes('--dev')) {
        ensureDistDir();
        await buildDev();
    } else {
        await build();
    }
}

// Handle errors
process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
});

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Build failed:', error);
        process.exit(1);
    });
}

module.exports = { build, buildDev, buildProd };
