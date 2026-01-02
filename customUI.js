/**
 * Custom.js - Interface Component Configuration & Customization
 * 
 * For Neophyte Developers - Just modify the componentConfig object below!
 * =========================================================================
 * 
 * INTERFACE COMPONENTS are complex UI elements like "Files", "NoteX", etc.
 * Each component can have multiple child elements, buttons, and content.
 * 
 * STEP 1: Define your components in the componentConfig object
 * STEP 2: Modify the properties for each component
 * STEP 3: Call ComponentCustomizer.initializeAll() in your main script
 * 
 * That's it! No complex code needed.
 */

// ============================================================================
// ↓↓↓ EDIT THIS SECTION TO CUSTOMIZE YOUR INTERFACE COMPONENTS ↓↓↓
// ============================================================================

const componentConfig = {
    // NoteX - HTML content ribbon
    "NoteX": {
        selector: ".html-ribbon-dropdown",  // CSS class or ID selector
        display: "hide",                    // "show" | "hide" | "unhide"
        space: "preserve",                  // "preserve" | "autoadjust" | "collapse"
        condition: null,                    // null OR function that returns true/false
        password: "none",                   // "none" | "required" | "admin-only"
        protected: false                    // true = disable component, false = enable
    },


    "NoteY": {
        selector: ".md-ribbon-dropdown",  // CSS class or ID selector
        display: "hide",                    // "show" | "hide" | "unhide"
        space: "collapse",                  // "preserve" | "autoadjust" | "collapse"
        condition: null,                    // null OR function that returns true/false
        password: "none",                   // "none" | "required" | "admin-only"
        protected: false                    // true = disable component, false = enable
    },


    // Videos ribbon
    "VideosX": {
        selector: ".videos-ribbon-dropdown",
        display: "show",
        space: "preserve",
        condition: null,
        password: "none",
        protected: false
    },

    // Files dropdown (if exists)
    "Files": {
        selector: ".files-dropdown",
        display: "hide",
        space: "collapse",
        condition: null,
        password: "none",
        protected: false
    },

    // Advanced Filter (SQL Section)
    "AdvancedFilter": {
        selector: [".sql-filter-toggle", ".sql-section"],
        display: "hide",
        space: "preserve",
        condition: null,
        password: "none",
        protected: false
    },

    // AllFiles / SingleFile toggle (controls multi-file view)
    "AllFilesToggle": {
        selector: ".multiple-datasets-toggle",
        display: "hide",
        space: "preserve",
        condition: null,
        password: "none",
        protected: false
    },

    "SingleFileToggle": {
        selector: ".multiple-datasets-toggle",
        display: "hide",
        space: "preserve",
        condition: null,
        password: "none",
        protected: false
    },

    // Data UI (DATA button and statistics modal)
    "DataUI": {
        selector: [".data-btn", "#stats-modal"],
        display: "hide",
        space: "preserve",
        condition: null,
        password: "none",
        protected: false
    },

    // Add more components here following the same pattern...
    // "componentName": { selector: ".class-name or #id-name", display: "show", ... }
};

// ============================================================================
// ↑↑↑ END OF CONFIGURATION - STOP EDITING ABOVE THIS LINE ↑↑↑
// ============================================================================

/**
 * Component Customizer - Main handler for interface components
 * No need to edit the code below unless you know JavaScript
 */
const ComponentCustomizer = {
    
    config: componentConfig,
    
    /**
     * Initialize all components based on configuration
     * Call this ONCE when page loads
     * Example: ComponentCustomizer.initializeAll();
     */
    initializeAll: function() {
        console.log('🎨 Initializing components from configuration...');
        
        Object.keys(this.config).forEach(componentName => {
            const settings = this.config[componentName];
            let components = [];
            
            // Try to find component by selector (class or ID)
            if (settings.selector) {
                const selectors = Array.isArray(settings.selector) ? settings.selector : [settings.selector];
                selectors.forEach(selector => {
                    const el = document.querySelector(selector);
                    if (el) components.push(el);
                });
            }
            
            if (components.length === 0) {
                console.warn(`⚠️  Component "${componentName}" with selector "${JSON.stringify(settings.selector)}" not found`);
                return;
            }
            
            console.log(`🔍 Found component: ${componentName}`);
            
            // Check condition
            if (settings.condition && typeof settings.condition === 'function') {
                if (!settings.condition()) {
                    console.log(`✓ Component "${componentName}" condition not met - hiding`);
                    components.forEach(component => {
                        this._hideComponent(component, componentName, settings.space);
                    });
                    return;
                }
            }
            
            // Apply display setting to all matching components
            if (settings.display === 'hide') {
                components.forEach(component => {
                    this._hideComponent(component, componentName, settings.space);
                });
                console.log(`✓ Component "${componentName}" hidden`);
            } else if (settings.display === 'show' || settings.display === 'unhide') {
                components.forEach(component => {
                    this._showComponent(component, componentName, settings.space);
                });
                console.log(`✓ Component "${componentName}" shown`);
            }
            
            // Apply protected/disabled setting
            if (settings.protected === true) {
                components.forEach(component => {
                    this._protectComponent(component, componentName);
                });
                console.log(`✓ Component "${componentName}" protected`);
            } else {
                components.forEach(component => {
                    this._unprotectComponent(component, componentName);
                });
            }
            
            // Apply password/role restriction
            components.forEach(component => {
                this._applyPasswordRestriction(component, componentName, settings.password);
            });
            
            console.log(`✓ Component "${componentName}" configured`);
        });
        
        console.log('✅ All components initialized!');
    },
    
    // ========== HELPER METHODS (No need to edit) ==========
    
    _hideComponent: function(component, componentId, space) {
        component.setAttribute('data-hidden', 'true');
        
        if (space === 'collapse') {
            component.style.display = 'none';
            component.style.visibility = 'hidden';
            component.style.height = '0';
            component.style.overflow = 'hidden';
            component.style.margin = '0';
            component.style.padding = '0';
        } else if (space === 'autoadjust') {
            component.style.display = 'none';
            component.style.position = 'absolute';
            component.style.pointerEvents = 'none';
            component.style.opacity = '0';
        } else {
            // 'preserve' - just hide without affecting layout much
            component.style.display = 'none';
        }
    },
    
    _showComponent: function(component, componentId, space) {
        component.style.display = '';
        component.removeAttribute('data-hidden');
        component.style.position = '';
        component.style.visibility = '';
        component.style.height = '';
        component.style.overflow = '';
        component.style.pointerEvents = '';
        component.style.opacity = '';
    },
    
    _protectComponent: function(component, componentId) {
        component.setAttribute('data-protected', 'true');
        component.style.opacity = '0.5';
        component.style.pointerEvents = 'none';
        component.style.cursor = 'not-allowed';
        
        // Disable all interactive elements within the component
        const buttons = component.querySelectorAll('button, input, select, textarea, a[onclick]');
        buttons.forEach(el => {
            el.disabled = true;
            el.setAttribute('data-protected-by-parent', 'true');
        });
    },
    
    _unprotectComponent: function(component, componentId) {
        component.removeAttribute('data-protected');
        component.style.opacity = '';
        component.style.pointerEvents = '';
        component.style.cursor = '';
        
        // Re-enable interactive elements within the component
        const buttons = component.querySelectorAll('[data-protected-by-parent="true"]');
        buttons.forEach(el => {
            el.disabled = false;
            el.removeAttribute('data-protected-by-parent');
        });
    },
    
    _applyPasswordRestriction: function(component, componentId, passwordLevel) {
        if (passwordLevel === 'admin-only') {
            const userRole = localStorage.getItem('userRole');
            if (userRole !== 'admin') {
                component.style.opacity = '0.6';
                component.style.pointerEvents = 'none';
                component.title = 'Admin access required';
            }
        } else if (passwordLevel === 'required') {
            const isLoggedIn = localStorage.getItem('userLoggedIn');
            if (isLoggedIn !== 'true') {
                component.style.opacity = '0.6';
                component.style.pointerEvents = 'none';
                component.title = 'Login required';
            }
        }
    },
    
    // ========== RUNTIME METHODS (Use these to change components after page loads) ==========
    
    /**
     * Get component element by name (looks up selector from config)
     */
    _getComponent: function(componentName) {
        const settings = this.config[componentName];
        if (!settings || !settings.selector) {
            console.warn(`⚠️  Component "${componentName}" not configured`);
            return null;
        }
        return document.querySelector(settings.selector);
    },
    
    /**
     * Hide a component at runtime
     * Example: ComponentCustomizer.hide('NoteX');
     */
    hide: function(componentName) {
        const component = this._getComponent(componentName);
        if (component) {
            component.style.display = 'none';
            console.log(`✓ Hidden: ${componentName}`);
        } else {
            console.warn(`⚠️  Component "${componentName}" not found`);
        }
    },
    
    /**
     * Show a component at runtime
     * Example: ComponentCustomizer.show('NoteX');
     */
    show: function(componentName) {
        const component = this._getComponent(componentName);
        if (component) {
            component.style.display = '';
            console.log(`✓ Shown: ${componentName}`);
        } else {
            console.warn(`⚠️  Component "${componentName}" not found`);
        }
    },
    
    /**
     * Toggle component visibility
     * Example: ComponentCustomizer.toggle('NoteX');
     */
    toggle: function(componentName) {
        const component = this._getComponent(componentName);
        if (component) {
            component.style.display = component.style.display === 'none' ? '' : 'none';
            console.log(`✓ Toggled: ${componentName}`);
        } else {
            console.warn(`⚠️  Component "${componentId}" not found`);
        }
    },
    
    /**
     * Protect/disable a component (make it unclickable)
     * Example: ComponentCustomizer.protect('NoteX');
     */
    protect: function(componentName) {
        const component = this._getComponent(componentName);
        if (component) {
            component.style.opacity = '0.5';
            component.style.pointerEvents = 'none';
            component.style.cursor = 'not-allowed';
            
            // Disable all buttons and inputs in component
            const elements = component.querySelectorAll('button, input, select, textarea');
            elements.forEach(el => el.disabled = true);
            
            console.log(`✓ Protected: ${componentName}`);
        } else {
            console.warn(`⚠️  Component "${componentName}" not found`);
        }
    },
    
    /**
     * Unprotect/enable a component (make it clickable again)
     * Example: ComponentCustomizer.unprotect('NoteX');
     */
    unprotect: function(componentName) {
        const component = this._getComponent(componentName);
        if (component) {
            component.style.opacity = '';
            component.style.pointerEvents = '';
            component.style.cursor = '';
            
            // Enable all buttons and inputs in component
            const elements = component.querySelectorAll('button, input, select, textarea');
            elements.forEach(el => el.disabled = false);
            
            console.log(`✓ Unprotected: ${componentName}`);
        } else {
            console.warn(`⚠️  Component "${componentName}" not found`);
        }
    },
    
    /**
     * Apply custom CSS to a component
     * Example: ComponentCustomizer.setStyle('NoteX', 'background-color: lightblue; padding: 20px;');
     */
    setStyle: function(componentName, cssString) {
        const component = this._getComponent(componentName);
        if (component) {
            component.style.cssText = cssString;
            console.log(`✓ Style applied: ${componentName}`);
        } else {
            console.warn(`⚠️  Component "${componentName}" not found`);
        }
    },
    
    /**
     * Add a CSS class to a component
     * Example: ComponentCustomizer.addClass('NoteX', 'highlighted');
     */
    addClass: function(componentName, className) {
        const component = this._getComponent(componentName);
        if (component) {
            component.classList.add(className);
            console.log(`✓ Class added: ${className} to ${componentName}`);
        } else {
            console.warn(`⚠️  Component "${componentName}" not found`);
        }
    },
    
    /**
     * Remove a CSS class from a component
     * Example: ComponentCustomizer.removeClass('NoteX', 'highlighted');
     */
    removeClass: function(componentName, className) {
        const component = this._getComponent(componentName);
        if (component) {
            component.classList.remove(className);
            console.log(`✓ Class removed: ${className} from ${componentName}`);
        } else {
            console.warn(`⚠️  Component "${componentName}" not found`);
        }
    },
    
    /**
     * Get component information
     * Example: const info = ComponentCustomizer.info('NoteX');
     */
    info: function(componentName) {
        const component = this._getComponent(componentName);
        if (component) {
            return {
                name: componentName,
                visible: component.style.display !== 'none',
                protected: component.getAttribute('data-protected') === 'true',
                class: component.className,
                innerHTML: component.innerHTML.substring(0, 100) + '...'
            };
        } else {
            console.warn(`⚠️  Component "${componentName}" not found`);
            return null;
        }
    }
};

// Make ComponentCustomizer available globally
window.ComponentCustomizer = ComponentCustomizer;
