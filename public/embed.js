(function() {
    'use strict';
    
    // Configuration
    const WIDGET_BASE_URL = 'https://fast-bulldog-662.convex.app'; // Update this to your actual domain
    
    window.ChatBaseWidget = {
        // Main embed function
        embed: function(options = {}) {
            const {
                chatbotId = 'default',
                containerId = null,
                width = '400px',
                height = '600px',
                position = 'bottom-right', // bottom-right, bottom-left, inline
                theme = 'light'
            } = options;
            
            const widgetUrl = `${WIDGET_BASE_URL}/widget.html?chatbotId=${encodeURIComponent(chatbotId)}&theme=${theme}`;
            
            if (position === 'inline' && containerId) {
                // Inline embedding in specific container
                this.createInlineWidget(containerId, widgetUrl, width, height);
            } else {
                // Floating widget
                this.createFloatingWidget(widgetUrl, width, height, position);
            }
        },
        
        // Create inline widget in specific container
        createInlineWidget: function(containerId, widgetUrl, width, height) {
            const container = document.getElementById(containerId);
            if (!container) {
                console.error(`ChatBase Widget: Container with ID '${containerId}' not found`);
                return;
            }
            
            const iframe = this.createIframe(widgetUrl, width, height);
            iframe.style.border = 'none';
            iframe.style.borderRadius = '12px';
            iframe.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
            
            container.appendChild(iframe);
        },
        
        // Create floating widget
        createFloatingWidget: function(widgetUrl, width, height, position) {
            // Create toggle button
            const toggleButton = this.createToggleButton(position);
            document.body.appendChild(toggleButton);
            
            // Create widget container
            const widgetContainer = this.createWidgetContainer(position, width, height);
            const iframe = this.createIframe(widgetUrl, '100%', '100%');
            
            widgetContainer.appendChild(iframe);
            document.body.appendChild(widgetContainer);
            
            // Toggle functionality
            let isOpen = false;
            toggleButton.addEventListener('click', () => {
                isOpen = !isOpen;
                widgetContainer.style.display = isOpen ? 'block' : 'none';
                toggleButton.style.transform = isOpen ? 'rotate(45deg)' : 'rotate(0deg)';
            });
            
            // Close when clicking outside
            document.addEventListener('click', (e) => {
                if (isOpen && !widgetContainer.contains(e.target) && !toggleButton.contains(e.target)) {
                    isOpen = false;
                    widgetContainer.style.display = 'none';
                    toggleButton.style.transform = 'rotate(0deg)';
                }
            });
        },
        
        // Create iframe element
        createIframe: function(src, width, height) {
            const iframe = document.createElement('iframe');
            iframe.src = src;
            iframe.style.width = width;
            iframe.style.height = height;
            iframe.style.border = 'none';
            iframe.setAttribute('allow', 'microphone; camera');
            iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms');
            
            // Handle dynamic height adjustment
            window.addEventListener('message', (event) => {
                if (event.source === iframe.contentWindow && event.data.type === 'resize') {
                    iframe.style.height = event.data.height + 'px';
                }
            });
            
            return iframe;
        },
        
        // Create toggle button for floating widget
        createToggleButton: function(position) {
            const button = document.createElement('button');
            button.innerHTML = '💬';
            
            // Base styles
            Object.assign(button.style, {
                position: 'fixed',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                border: 'none',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontSize: '24px',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                zIndex: '9999',
                transition: 'all 0.3s ease',
                outline: 'none'
            });
            
            // Position-specific styles
            if (position === 'bottom-right') {
                button.style.bottom = '20px';
                button.style.right = '20px';
            } else if (position === 'bottom-left') {
                button.style.bottom = '20px';
                button.style.left = '20px';
            }
            
            // Hover effects
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'scale(1.1)';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'scale(1)';
            });
            
            return button;
        },
        
        // Create widget container for floating widget
        createWidgetContainer: function(position, width, height) {
            const container = document.createElement('div');
            
            // Base styles
            Object.assign(container.style, {
                position: 'fixed',
                width: width,
                height: height,
                zIndex: '9998',
                display: 'none',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)'
            });
            
            // Position-specific styles
            if (position === 'bottom-right') {
                container.style.bottom = '100px';
                container.style.right = '20px';
            } else if (position === 'bottom-left') {
                container.style.bottom = '100px';
                container.style.left = '20px';
            }
            
            return container;
        }
    };
    
    // Auto-initialize if data attributes are present
    document.addEventListener('DOMContentLoaded', () => {
        const autoEmbedElements = document.querySelectorAll('[data-chatbase-widget]');
        
        autoEmbedElements.forEach(element => {
            const chatbotId = element.getAttribute('data-chatbot-id') || 'default';
            const position = element.getAttribute('data-position') || 'inline';
            const width = element.getAttribute('data-width') || '400px';
            const height = element.getAttribute('data-height') || '600px';
            
            if (position === 'inline') {
                if (!element.id) {
                    element.id = 'chatbase-widget-' + Math.random().toString(36).substr(2, 9);
                }
                
                window.ChatBaseWidget.embed({
                    chatbotId: chatbotId,
                    containerId: element.id,
                    width: width,
                    height: height,
                    position: 'inline'
                });
            }
        });
    });
})(); 