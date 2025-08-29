#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Deployment configuration
const config = {
    // Netlify deployment (for CDN hosting)
    netlify: {
        siteName: 'accessmatic-cdn',
        buildDir: 'dist',
        customDomain: 'cdn.accessmatic.us'
    },
    
    // AWS S3 deployment (alternative)
    s3: {
        bucket: 'accessmatic-cdn',
        region: 'us-east-1',
        cloudfront: 'E1234567890123'
    },
    
    // GitHub Pages deployment (free option)
    github: {
        repo: 'accessmatic-sdk',
        branch: 'gh-pages'
    }
};

// Colors for console output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(message, color = 'reset') {
    console.log(colors[color] + message + colors.reset);
}

function error(message) {
    log(`❌ ${message}`, 'red');
}

function success(message) {
    log(`✅ ${message}`, 'green');
}

function info(message) {
    log(`ℹ️  ${message}`, 'blue');
}

function warning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

// Check if required files exist
function validateBuild() {
    info('Validating build files...');
    
    const requiredFiles = [
        'dist/accessmatic.js',
        'dist/accessmatic.min.js',
        'dist/index.html'
    ];
    
    for (const file of requiredFiles) {
        if (!fs.existsSync(file)) {
            error(`Required file missing: ${file}`);
            error('Run "npm run build" first');
            process.exit(1);
        }
    }
    
    success('Build files validated');
}

// Test the built SDK
async function testSDK() {
    info('Testing SDK functionality...');
    
    try {
        const sdkContent = fs.readFileSync('dist/accessmatic.min.js', 'utf8');
        
        // Basic validation checks
        const checks = [
            { test: sdkContent.includes('AccessMaticSDK'), message: 'Main class exists' },
            { test: sdkContent.includes('discoverPDFs'), message: 'Discovery function exists' },
            { test: sdkContent.includes('processDocument'), message: 'Processing function exists' },
            { test: sdkContent.length > 1000, message: 'File has content' }
        ];
        
        for (const check of checks) {
            if (!check.test) {
                error(`SDK test failed: ${check.message}`);
                process.exit(1);
            }
        }
        
        success('SDK tests passed');
        
    } catch (err) {
        error(`SDK test error: ${err.message}`);
        process.exit(1);
    }
}

// Deploy to Netlify
async function deployToNetlify() {
    info('Deploying to Netlify...');
    
    try {
        // Check if Netlify CLI is installed
        await execAsync('netlify --version');
        
        // Deploy to Netlify
        const { stdout } = await execAsync('netlify deploy --prod --dir=dist');
        
        success('Deployed to Netlify successfully');
        
        // Extract the URL from output
        const urlMatch = stdout.match(/Website URL: (https?:\/\/[^\s]+)/);
        if (urlMatch) {
            info(`🌐 Live at: ${urlMatch[1]}`);
        }
        
        return true;
        
    } catch (error) {
        if (error.message.includes('netlify: command not found')) {
            warning('Netlify CLI not found. Install with: npm install -g netlify-cli');
            return false;
        }
        throw error;
    }
}

// Deploy to GitHub Pages
async function deployToGitHub() {
    info('Deploying to GitHub Pages...');
    
    try {
        // Check if we're in a git repository
        await execAsync('git status');
        
        // Create gh-pages branch if it doesn't exist
        try {
            await execAsync('git checkout gh-pages');
        } catch (err) {
            info('Creating gh-pages branch...');
            await execAsync('git checkout -b gh-pages');
        }
        
        // Copy dist files to root
        await execAsync('cp -r dist/* .');
        
        // Commit and push
        await execAsync('git add .');
        await execAsync('git commit -m "Deploy SDK to GitHub Pages"');
        await execAsync('git push origin gh-pages');
        
        // Switch back to main branch
        await execAsync('git checkout main || git checkout master');
        
        success('Deployed to GitHub Pages');
        info('🌐 Live at: https://yourusername.github.io/accessmatic-sdk/');
        
        return true;
        
    } catch (error) {
        warning('GitHub Pages deployment failed. Make sure you have git configured and repository set up.');
        return false;
    }
}

// Deploy to AWS S3
async function deployToS3() {
    info('Deploying to AWS S3...');
    
    try {
        // Check if AWS CLI is installed
        await execAsync('aws --version');
        
        // Sync dist directory to S3
        const syncCommand = `aws s3 sync dist/ s3://${config.s3.bucket}/ --delete --region ${config.s3.region}`;
        await execAsync(syncCommand);
        
        // Invalidate CloudFront cache if configured
        if (config.s3.cloudfront) {
            info('Invalidating CloudFront cache...');
            await execAsync(`aws cloudfront create-invalidation --distribution-id ${config.s3.cloudfront} --paths "/*"`);
        }
        
        success('Deployed to AWS S3');
        info(`🌐 Live at: https://${config.s3.bucket}.s3.amazonaws.com/`);
        
        return true;
        
    } catch (error) {
        if (error.message.includes('aws: command not found')) {
            warning('AWS CLI not found. Install from: https://aws.amazon.com/cli/');
            return false;
        }
        throw error;
    }
}

// Create deployment artifacts
function createDeploymentArtifacts() {
    info('Creating deployment artifacts...');
    
    // Create netlify.toml for Netlify deployment
    const netlifyConfig = `[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
    
[[headers]]
  for = "*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "index.html"
  [headers.values]
    Cache-Control = "public, max-age=3600"

[[redirects]]
  from = "/v1/*"
  to = "/:splat"
  status = 200

[[redirects]]
  from = "/latest/*"
  to = "/:splat"
  status = 200
`;
    
    fs.writeFileSync('netlify.toml', netlifyConfig);
    
    // Create _headers file for additional security
    const headersFile = `/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  
/*.js
  Content-Type: application/javascript; charset=utf-8
  Access-Control-Allow-Origin: *
  
/*.css  
  Content-Type: text/css; charset=utf-8
  Access-Control-Allow-Origin: *
`;
    
    fs.writeFileSync('dist/_headers', headersFile);
    
    // Create robots.txt
    const robotsTxt = `User-agent: *
Allow: /

Sitemap: https://cdn.accessmatic.us/sitemap.xml
`;
    
    fs.writeFileSync('dist/robots.txt', robotsTxt);
    
    success('Deployment artifacts created');
}

// Generate integrity hashes and update documentation
function updateIntegrityHashes() {
    info('Updating integrity hashes...');
    
    const crypto = require('crypto');
    
    const files = ['accessmatic.js', 'accessmatic.min.js'];
    const hashes = {};
    
    files.forEach(file => {
        const filePath = path.join('dist', file);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath);
            const hash = crypto.createHash('sha384').update(content).digest('base64');
            hashes[file] = `sha384-${hash}`;
        }
    });
    
    // Update README with latest integrity hashes
    let readmeContent = fs.readFileSync('README.md', 'utf8');
    
    // Add integrity examples to README
    const integritySection = `
## 🔐 Integrity Verification

For enhanced security, you can verify the SDK using SRI (Subresource Integrity):

\`\`\`html
<!-- Production version with integrity hash -->
<script 
  src="https://cdn.accessmatic.us/accessmatic.min.js"
  integrity="${hashes['accessmatic.min.js'] || 'sha384-...'}"
  crossorigin="anonymous"
  data-accessmatic-key="your-api-key">
</script>

<!-- Development version with integrity hash -->
<script 
  src="https://cdn.accessmatic.us/accessmatic.js"
  integrity="${hashes['accessmatic.js'] || 'sha384-...'}"
  crossorigin="anonymous"
  data-accessmatic-key="your-api-key">
</script>
\`\`\`
`;
    
    // Insert integrity section before the Links section
    if (!readmeContent.includes('🔐 Integrity Verification')) {
        readmeContent = readmeContent.replace('## 🔗 Links', integritySection + '\n## 🔗 Links');
        fs.writeFileSync('README.md', readmeContent);
    }
    
    success('Integrity hashes updated');
    
    return hashes;
}

// Main deployment function
async function deploy() {
    const startTime = Date.now();
    
    log('🚀 Starting AccessMatic SDK deployment...', 'blue');
    
    try {
        // Pre-deployment checks
        validateBuild();
        await testSDK();
        createDeploymentArtifacts();
        const hashes = updateIntegrityHashes();
        
        // Deployment attempts (try multiple platforms)
        const deploymentResults = [];
        
        // Try Netlify first (recommended for CDN)
        try {
            const netlifySuccess = await deployToNetlify();
            deploymentResults.push({ platform: 'Netlify', success: netlifySuccess });
        } catch (err) {
            warning(`Netlify deployment failed: ${err.message}`);
            deploymentResults.push({ platform: 'Netlify', success: false, error: err.message });
        }
        
        // Try GitHub Pages as backup
        if (!deploymentResults.some(r => r.success)) {
            try {
                const githubSuccess = await deployToGitHub();
                deploymentResults.push({ platform: 'GitHub Pages', success: githubSuccess });
            } catch (err) {
                warning(`GitHub Pages deployment failed: ${err.message}`);
                deploymentResults.push({ platform: 'GitHub Pages', success: false, error: err.message });
            }
        }
        
        // Try AWS S3 if available
        if (!deploymentResults.some(r => r.success)) {
            try {
                const s3Success = await deployToS3();
                deploymentResults.push({ platform: 'AWS S3', success: s3Success });
            } catch (err) {
                warning(`AWS S3 deployment failed: ${err.message}`);
                deploymentResults.push({ platform: 'AWS S3', success: false, error: err.message });
            }
        }
        
        // Summary
        const duration = Date.now() - startTime;
        const successfulDeployments = deploymentResults.filter(r => r.success);
        
        if (successfulDeployments.length > 0) {
            success(`🎉 SDK deployed successfully in ${duration}ms`);
            
            successfulDeployments.forEach(deployment => {
                success(`✅ ${deployment.platform}: Deployed`);
            });
            
            // Post-deployment information
            log('\n📋 Next Steps:', 'blue');
            log('1. Update your DNS records to point cdn.accessmatic.us to the deployed URL');
            log('2. Test the SDK on a sample website');
            log('3. Update your documentation with the new URLs');
            
            if (hashes['accessmatic.min.js']) {
                log(`\n🔐 Integrity Hash (for security):`);
                log(`${hashes['accessmatic.min.js']}`);
            }
            
        } else {
            error('❌ All deployment attempts failed');
            deploymentResults.forEach(deployment => {
                if (!deployment.success) {
                    error(`❌ ${deployment.platform}: ${deployment.error || 'Failed'}`);
                }
            });
            
            log('\n🛠️  Manual Deployment Options:', 'yellow');
            log('1. Upload dist/ folder to any static hosting service');
            log('2. Set up CDN with proper CORS headers');
            log('3. Configure SSL certificate for HTTPS');
            
            process.exit(1);
        }
        
    } catch (error) {
        error(`💥 Deployment failed: ${error.message}`);
        process.exit(1);
    }
}

// CLI handling
function showHelp() {
    log('AccessMatic SDK Deployment Tool\n', 'blue');
    log('Usage: node deploy.js [options]\n');
    log('Options:');
    log('  --netlify    Deploy to Netlify only');
    log('  --github     Deploy to GitHub Pages only');
    log('  --s3         Deploy to AWS S3 only');
    log('  --test       Test deployment without deploying');
    log('  --help       Show this help message\n');
    log('Examples:');
    log('  node deploy.js              # Deploy to all available platforms');
    log('  node deploy.js --netlify    # Deploy to Netlify only');
    log('  node deploy.js --test       # Test without deploying');
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--help')) {
        showHelp();
        return;
    }
    
    if (args.includes('--test')) {
        log('🧪 Testing deployment (no actual deployment)', 'blue');
        validateBuild();
        await testSDK();
        createDeploymentArtifacts();
        updateIntegrityHashes();
        success('✅ All tests passed - ready for deployment');
        return;
    }
    
    // Platform-specific deployment
    if (args.includes('--netlify')) {
        validateBuild();
        await testSDK();
        createDeploymentArtifacts();
        await deployToNetlify();
        return;
    }
    
    if (args.includes('--github')) {
        validateBuild();
        await testSDK();
        await deployToGitHub();
        return;
    }
    
    if (args.includes('--s3')) {
        validateBuild();
        await testSDK();
        await deployToS3();
        return;
    }
    
    // Full deployment
    await deploy();
}

// Error handling
process.on('unhandledRejection', (error) => {
    log(`💥 Unhandled error: ${error.message}`, 'red');
    process.exit(1);
});

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        log(`💥 Deployment failed: ${error.message}`, 'red');
        process.exit(1);
    });
}

module.exports = {
    deploy,
    deployToNetlify,
    deployToGitHub,
    deployToS3,
    validateBuild,
    testSDK
};
