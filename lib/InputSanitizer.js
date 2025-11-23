/**
 * Input Sanitizer
 * 
 * Provides comprehensive input sanitization and validation to prevent
 * SQL injection, XSS, and other injection attacks.
 */
class InputSanitizer {
    /**
     * Sanitizes any value type by specifying the sanitization type in the options {type:'string'}
     * 
     * @param {*} value - Value to sanitize
     * @param {string} type - Type of sanitization to perform
     * @param {object} options - Sanitization options {...}
     * @returns {*} Sanitized value
     * 
     * @example
     * const sanitized = InputSanitizer.sanitize(userData, 'string', {maxLength:150})
     */
    static sanitize(value, type = 'string', options = {}) {
        switch(type.toLowerCase()) {
            case 'string':
                return this.sanitizeString(value, options);
            case 'int':
            case 'integer':
                return this.sanitizeInteger(value, options);
            case 'number':
            case 'float':
                return this.sanitizeFloat(value, options);
            case 'bool':
            case 'boolean':
                return this.sanitizeBoolean(value, options);
            case 'email':
                return this.sanitizeEmail(value, options);
            case 'url':
                return this.sanitizeUrl(value, options);
            case 'object':
                return this.sanitizeObject(value, options);
            case 'array':
                return this.sanitizeArray(value, null, options);
            case 'email':
                return this.sanitizeEmail(value, options);
            case 'password':
                return this.sanitizePassword(value, options);
        }
        return value;
    }

    /**
     * Sanitize a string value
     * Removes or escapes potentially dangerous characters
     * 
     * @param {string} value - Value to sanitize
     * @param {object} options - Sanitization options {allowHtml:false, trim:true, maxLength:10}
     * @returns {string} Sanitized value
     */
    static sanitizeString(value, options = {}) {
        if (value === null || value === undefined) {
            return '';
        }

        let sanitized = String(value);

        // Trim whitespace
        if (options.trim !== false) {
            sanitized = sanitized.trim();
        }

        // Remove HTML tags unless explicitly allowed
        if (!options.allowHtml) {
            sanitized = this._stripHtmlTags(sanitized);
        }

        // Remove null bytes (potential for SQL injection)
        sanitized = sanitized.replace(/\0/g, '');

        // Enforce maximum length
        if (options.maxLength && sanitized.length > options.maxLength) {
            sanitized = sanitized.substring(0, options.maxLength);
        }

        return sanitized;
    }

    /**
     * Sanitize an integer value
     * 
     * @param {*} value - Value to sanitize
     * @param {object} options - Sanitization options {min:0, max:10, default:0}
     * @returns {int} Sanitized integer
     */
    static sanitizeInteger(value, options = {}) {
        const parsed = parseInt(value, 10);

        if (isNaN(parsed)) {
            return options.default !== undefined ? options.default : 0;
        }

        let sanitized = parsed;

        // Enforce minimum
        if (options.min !== undefined && sanitized < options.min) {
            sanitized = options.min;
        }

        // Enforce maximum
        if (options.max !== undefined && sanitized > options.max) {
            sanitized = options.max;
        }

        return sanitized;
    }

    /**
     * Sanitize a float/decimal value
     * 
     * @param {*} value - Value to sanitize
     * @param {object} options - Sanitization options {min:0, max:10, default:0, decimals:2}
     * @returns {number} Sanitized float
     */
    static sanitizeFloat(value, options = {}) {
        const parsed = parseFloat(value);

        if (isNaN(parsed)) {
            return options.default !== undefined ? options.default : 0;
        }

        let sanitized = parsed;

        // Round to specified decimal places
        if (options.decimals !== undefined) {
            const multiplier = Math.pow(10, options.decimals);
            sanitized = Math.round(sanitized * multiplier) / multiplier;
        }

        // Enforce minimum
        if (options.min !== undefined && sanitized < options.min) {
            sanitized = options.min;
        }

        // Enforce maximum
        if (options.max !== undefined && sanitized > options.max) {
            sanitized = options.max;
        }

        return sanitized;
    }

    /**
     * 
     * @param {string} value 
     * @param {object} options 
     * @returns 
     */
    static sanitizeBoolean(value, options = {}) {
        if (value === null || value === undefined) {
            return options.default || null;
        }
        if (typeof value === 'boolean') return true;
        if (typeof value === 'string') {
            return ['true', '1', 'yes'].includes(value.toLowerCase());
        }
        return !!value;
    }

    /**
     * Sanitize email address
     * 
     * @param {string} email - Email to sanitize
     * @returns {string} Sanitized email or empty string if invalid
     */
    static sanitizeEmail(email) {
        if (!email) return '';

        let sanitized = String(email).trim().toLowerCase();

        // Remove any characters that aren't valid in email addresses
        sanitized = sanitized.replace(/[^a-z0-9@._+-]/g, '');

        // Basic email format validation
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(sanitized)) return '';

        return sanitized;
    }

    /**
     * This will validate the password and return an empty string if it fails
     * or the original password value if it passes
     * 
     * @param {string} password 
     * @returns {string} password if valid
     */
    static sanitizePassword(password) {
        if (!password) return '';

        let sanitized = String(password).trim();

        const regex = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#\-_~$%^&*()])(?=\S*$).{8,20}$/;

        if (!regex.test(sanitized)) return '';

        return sanitized;
    }

    /**
     * Sanitize URL
     * 
     * @param {string} url - URL to sanitize
     * @param {object} options - Sanitization options {allowedProtocols:['http', 'https']}
     * @returns {string} Sanitized URL or empty string if invalid
     */
    static sanitizeUrl(url, options = {}) {
        if (!url) return '';

        const allowedProtocols = options.allowedProtocols || ['http', 'https'];
        let sanitized = String(url).trim();

        try {
            const urlObj = new URL(sanitized);
            
            // Check if protocol is allowed
            const protocol = urlObj.protocol.replace(':', '');
            if (!allowedProtocols.includes(protocol)) {
                return '';
            }

            return urlObj.href;
        } catch (e) {
            return '';
        }
    }

    /**
     * Sanitize an object by applying sanitization to all properties
     * 
     * @param {object} obj - Object to sanitize
     * @param {object} schema - Sanitization schema defining rules for each field {name:{type:'string', maxLength:100}, age:{type:'integer', min:0, max:100}, email:{type:'email'}}
     * @returns {object} Sanitized object
     */
    static sanitizeObject(obj, schema) {
        const sanitized = {};

        for (const [key, rules] of Object.entries(schema)) {
            const value = obj[key];

            switch (rules.type) {
                case 'string':
                    sanitized[key] = this.sanitizeString(value, rules);
                    break;
                case 'int':
                case 'integer':
                    sanitized[key] = this.sanitizeInteger(value, rules);
                    break;
                case 'float':
                case 'number':
                    sanitized[key] = this.sanitizeFloat(value, rules);
                    break;
                case 'email':
                    sanitized[key] = this.sanitizeEmail(value);
                    break;
                case 'url':
                    sanitized[key] = this.sanitizeUrl(value, rules);
                    break;
                case 'bool':
                case 'boolean':
                    sanitized[key] = this.sanitizeBoolean(value, rules);
                    break;
                default:
                    sanitized[key] = value;
            }
        }

        return sanitized;
    }

    /**
     * Detect potential SQL injection attempts
     * 
     * @param {string} value - Value to check
     * @returns {boolean} True if potential SQL injection detected
     */
    static detectSqlInjection(value) {
        if (!value || typeof value !== 'string') {
            return false;
        }

        // Common SQL injection patterns
        const sqlInjectionPatterns = [
            /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
            /(UNION\s+SELECT)/i,
            /(-{2}|\/\*|\*\/)/,  // SQL comments
            /(\bOR\b|\bAND\b)\s+[\d\w]+\s*=\s*[\d\w]+/i,  // OR 1=1, AND 1=1
            /(;\s*(SELECT|INSERT|UPDATE|DELETE|DROP))/i,
            /(\bxp_|\bsp_)/i,  // SQL Server stored procedures
            /(INFORMATION_SCHEMA|SYSOBJECTS|SYSCOLUMNS)/i
        ];

        return sqlInjectionPatterns.some(pattern => pattern.test(value));
    }

    /**
     * Strip HTML tags from string
     * 
     * @param {string} value - String with potential HTML
     * @returns {string} String without HTML tags
     * @protected
     */
    static _stripHtmlTags(value) {
        return value.replace(/<[^>]*>/g, '');
    }

    /**
     * Escape special characters for HTML output (XSS prevention)
     * 
     * @param {string} value - Value to escape
     * @returns {string} HTML-safe value
     */
    static escapeHtml(value) {
        if (!value) return '';

        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2F;'
        };

        return String(value).replace(/[&<>"'/]/g, char => map[char]);
    }

    /**
     * Sanitize array of values
     * 
     * @param {Array} arr - Array to sanitize
     * @param {string} type - Type of sanitization to apply
     * @param {object} options - Sanitization options
     * @returns {Array} Sanitized array
     */
    static sanitizeArray(arr, type = 'string', options = {}) {
        if (!Array.isArray(arr)) {
            return [];
        }

        return arr.map(value => {
            switch (type) {
                case 'string':
                    return this.sanitizeString(value, options);
                case 'integer':
                    return this.sanitizeInteger(value, options);
                case 'float':
                    return this.sanitizeFloat(value, options);
                case 'email':
                    return this.sanitizeEmail(value);
                default:
                    return value;
            }
        });
    }
}

module.exports = InputSanitizer;