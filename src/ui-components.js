/**
 * AccessMatic SDK - UI Components
 * Loading modals, document viewer, and error handling
 */

// Add to the AccessMaticSDK class (we'll extend the main file)
Object.assign(AccessMaticSDK.prototype, {
    
    /**
     * Show processing modal with government-appropriate styling
     */
    showProcessingModal(pdfUrl) {
        this.hideExistingModals();
        
        const modal = this.createModal('processing');
        const fileName = this.extractFileName(pdfUrl);
        
        modal.innerHTML = `
            <div class="accessmatic-processing-content">
                <div class="processing-header">
                    <div class="govt-seal">🏛️</div>
                    <h3>Making Document Accessible</h3>
                    <button class="close-btn" aria-label="Close">&times;</button>
                </div>
                
                <div class="processing-body">
                    <div class="document-info">
                        <div class="file-icon">📄</div>
                        <div class="file-name">${fileName}</div>
                    </div>
                    
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress-fill"></div>
                        </div>
                        <div class="progress-text">Processing document...</div>
                    </div>
                    
                    <div class="processing-steps">
                        <div class="step active" data-step="1">
                            <span class="step-icon">📖</span>
                            <span class="step-text">Reading document</span>
                        </div>
                        <div class="step" data-step="2">
                            <span class="step-icon">🤖</span>
                            <span class="step-text">AI enhancement</span>
                        </div>
                        <div class="step" data-step="3">
                            <span class="step-icon">♿</span>
                            <span class="step-text">Accessibility validation</span>
                        </div>
                    </div>
                    
                    ${this.networkBlocked ? `
                        <div class="network-notice">
                            <div class="notice-icon">🔒</div>
                            <div class="notice-text">
                                <strong>Secure Network Detected</strong><br>
                                Processing locally with basic accessibility features
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        modal.querySelector('.close-btn').addEventListener('click', () => {
            this.hideProcessingModal();
        });
        
        // Start progress animation
        this.animateProgress();
        
        // Store reference
        this.currentModal = modal;
    },
    
    /**
     * Animate processing progress
     */
    animateProgress() {
        if (!this.currentModal) return;
        
        const progressFill = this.currentModal.querySelector('.progress-fill');
        const progressText = this.currentModal.querySelector('.progress-text');
        const steps = this.currentModal.querySelectorAll('.step');
        
        let progress = 0;
        let currentStep = 0;
        
        const messages = this.networkBlocked ? [
            'Scanning document structure...',
            'Applying accessibility features...',
            'Finalizing accessible version...'
        ] : [
            'Extracting text and images...',
            'AI analyzing document structure...',
            'Validating WCAG compliance...',
            'Generating accessible HTML...'
        ];
        
        const interval = setInterval(() => {
            progress += Math.random() * 15 + 5; // Variable progress
            
            if (progress > 100) progress = 100;
            
            progressFill.style.width = progress + '%';
            
            // Update step indicators
            const targetStep = Math.floor((progress / 100) * steps.length);
            if (targetStep > currentStep && currentStep < steps.length - 1) {
                steps[currentStep].classList.remove('active');
                currentStep++;
                steps[currentStep].classList.add('active');
                
                if (messages[currentStep]) {
                    progressText.textContent = messages[currentStep];
                }
            }
            
            if (progress >= 100) {
                clearInterval(interval);
                progressText.textContent = 'Processing complete!';
            }
        }, this.networkBlocked ? 500 : 800); // Faster for local processing
        
        this.progressInterval = interval;
    },
    
    /**
     * Hide processing modal
     */
    hideProcessingModal() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
        
        this.hideModal();
    },
    
    /**
     * Show accessible document viewer
     */
    showAccessibleDocument(document) {
        this.hideExistingModals();
        
        const modal = this.createModal('document');
        
        modal.innerHTML = `
            <div class="accessmatic-document-viewer">
                <div class="document-header">
                    <div class="header-left">
                        <h2>Accessible Document</h2>
                        <div class="accessibility-info">
                            <div class="score-badge score-${this.getScoreClass(document.accessibility_score)}">
                                Score: ${document.accessibility_score}%
                            </div>
                            <div class="compliance-badge compliance-${document.compliance_level}">
                                WCAG ${document.compliance_level}
                            </div>
                            ${document.processing_method === 'local' ? 
                                '<div class="method-badge">Locally Processed</div>' : ''
                            }
                        </div>
                    </div>
                    <div class="header-actions">
                        <button class="action-btn" id="toggle-original">View Original</button>
                        <button class="close-btn" aria-label="Close document viewer">&times;</button>
                    </div>
                </div>
                
                <div class="document-body">
                    <div class="document-content" id="accessible-content">
                        ${document.accessible_html}
                    </div>
                </div>
                
                <div class="document-footer">
                    <div class="footer-info">
                        ${document.message ? `<div class="processing-note">${document.message}</div>` : ''}
                        <div class="powered-by">
                            <span>Powered by</span> 
                            <a href="https://accessmatic.us" target="_blank">AccessMatic</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners
        modal.querySelector('.close-btn').addEventListener('click', () => {
            this.hideModal();
        });
        
        // Focus management for accessibility
        const content = modal.querySelector('.document-content');
        content.setAttribute('tabindex', '-1');
        content.focus();
        
        this.currentModal = modal;
    },
    
    /**
     * Show error fallback
     */
    showErrorFallback(pdfUrl, error) {
        this.hideExistingModals();
        
        const modal = this.createModal('error');
        const fileName = this.extractFileName(pdfUrl);
        
        modal.innerHTML = `
            <div class="accessmatic-error-content">
                <div class="error-header">
                    <div class="error-icon">⚠️</div>
                    <h3>Accessibility Processing Unavailable</h3>
                    <button class="close-btn" aria-label="Close">&times;</button>
                </div>
                
                <div class="error-body">
                    <div class="error-message">
                        <p>We're unable to process this document for accessibility right now.</p>
                        ${this.networkBlocked ? 
                            '<p><strong>Network restrictions detected.</strong> Contact your IT department about AccessMatic access for full functionality.</p>' :
                            '<p>This may be a temporary issue. Please try again in a few moments.</p>'
                        }
                    </div>
                    
                    <div class="error-actions">
                        <a href="${pdfUrl}" target="_blank" class="primary-btn">
                            Open Original PDF
                        </a>
                        <button class="secondary-btn" onclick="this.closest('.accessmatic-modal').remove()">
                            Close
                        </button>
                        ${!this.networkBlocked ? 
                            '<button class="secondary-btn" onclick="window.AccessMatic.handlePDFClick(\'' + pdfUrl + '\')">Try Again</button>' :
                            ''
                        }
                    </div>
                    
                    <div class="help-section">
                        <details>
                            <summary>Need help?</summary>
                            <div class="help-content">
                                <p>If you consistently see this message:</p>
                                <ul>
                                    <li>Contact your website administrator</li>
                                    <li>Check your network connection</li>
                                    <li>Email support: <a href="mailto:support@accessmatic.us">support@accessmatic.us</a></li>
                                </ul>
                                <p class="error-details">Error: ${error.message}</p>
                            </div>
                        </details>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.close-btn').addEventListener('click', () => {
            this.hideModal();
        });
        
        this.currentModal = modal;
    },
    
    /**
     * Create base modal structure
     */
    createModal(type) {
        const modal = document.createElement('div');
        modal.className = `accessmatic-modal accessmatic-${type}-modal`;
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'accessmatic-modal-title');
        
        // Add overlay
        const overlay = document.createElement('div');
        overlay.className = 'accessmatic-overlay';
        modal.appendChild(overlay);
        
        // Close on overlay click
        overlay.addEventListener('click', () => {
            this.hideModal();
        });
        
        // Escape key handling
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                this.hideModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
        
        return modal;
    },
    
    /**
     * Hide any existing modals
     */
    hideExistingModals() {
        document.querySelectorAll('.accessmatic-modal').forEach(modal => {
            modal.remove();
        });
        this.currentModal = null;
    },
    
    /**
     * Hide current modal
     */
    hideModal() {
        this.hideExistingModals();
    },
    
    // Utility methods
    extractFileName(url) {
        return url.split('/').pop().replace(/\.[^/.]+$/, "").replace(/[_-]/g, ' ');
    },
    
    getScoreClass(score) {
        if (score >= 90) return 'excellent';
        if (score >= 80) return 'good';
        if (score >= 70) return 'fair';
        return 'poor';
    },
    
    /**
     * Poll for completion when using API
     */
    async pollForCompletion(taskId, timeout = 30000) {
        const startTime = Date.now();
        const pollInterval = 2000;
        
        return new Promise((resolve, reject) => {
            const poll = async () => {
                if (Date.now() - startTime > timeout) {
                    reject(new Error('Processing timeout - please try again'));
                    return;
                }
                
                try {
                    const response = await fetch(`${this.config.apiUrl}/documents/${taskId}`, {
                        headers: {
                            'Authorization': `Bearer ${this.config.apiKey}`,
                            'X-AccessMatic-SDK': '1.0.0'
                        }
                    });
                    
                    if (!response.ok) {
                        throw new Error(`Status check failed: ${response.status}`);
                    }
                    
                    const result = await response.json();
                    
                    if (result.status === 'completed') {
                        resolve(result);
                    } else if (result.status === 'failed') {
                        reject(new Error(result.error || 'Document processing failed'));
                    } else {
                        // Still processing
                        setTimeout(poll, pollInterval);
                    }
                    
                } catch (error) {
                    reject(error);
                }
            };
            
            poll();
        });
    }
});
