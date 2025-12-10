/**
 * Validates that a URL is from a trusted source for monitoring links.
 * This helps prevent security issues when opening external URLs.
 * 
 * Trusted patterns include:
 * - localhost (any port)
 * - 127.0.0.1 (any port)
 * - Internal Docker networks (172.x.x.x, 192.168.x.x, 10.x.x.x)
 * - Explicitly configured trusted domains via environment variables
 */

const TRUSTED_HOSTNAMES = [
    'localhost',
    '127.0.0.1',
];

/**
 * Parse and cache trusted domains from environment variables
 * This is done once at module load time for performance
 */
const TRUSTED_DOMAINS = (import.meta.env.VITE_TRUSTED_DOMAINS || '')
    .split(',')
    .map((domain: string) => domain.trim())
    .filter((domain: string) => domain.length > 0);

/**
 * Checks if an IP address is from a private network range
 */
const isPrivateIP = (hostname: string): boolean => {
    // Check for IPv4 private ranges
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = hostname.match(ipv4Regex);
    
    if (!match) {
        return false;
    }
    
    const octets = match.slice(1).map(Number);
    
    // Validate that each octet is in the range 0-255
    if (octets.some(octet => octet > 255)) {
        return false;
    }
    
    const [first, second] = octets;
    
    // 10.0.0.0 - 10.255.255.255
    if (first === 10) {
        return true;
    }
    
    // 172.16.0.0 - 172.31.255.255
    if (first === 172 && second >= 16 && second <= 31) {
        return true;
    }
    
    // 192.168.0.0 - 192.168.255.255
    if (first === 192 && second === 168) {
        return true;
    }
    
    return false;
};

/**
 * Validates if a URL is safe to open
 * Returns true if the URL is from a trusted source, false otherwise
 */
export const isValidMonitoringURL = (urlString: string): boolean => {
    try {
        const url = new URL(urlString);
        
        // Only allow http and https protocols
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            return false;
        }
        
        const hostname = url.hostname.toLowerCase();
        
        // Check against trusted hostnames
        if (TRUSTED_HOSTNAMES.includes(hostname)) {
            return true;
        }
        
        // Check if it's a private IP
        if (isPrivateIP(hostname)) {
            return true;
        }
        
        // Check for additional trusted domains from environment variables
        // Use exact domain matching or proper subdomain matching to prevent attacks
        // e.g., if 'example.com' is trusted, 'maliciousexample.com' should NOT match
        if (TRUSTED_DOMAINS.some((domain: string) => 
            hostname === domain || hostname.endsWith('.' + domain)
        )) {
            return true;
        }
        
        return false;
    } catch (error) {
        // Invalid URL format
        console.error('Invalid URL format:', urlString, error);
        return false;
    }
};

/**
 * Safely opens a URL in a new window after validation
 * @param url The URL to open
 * @param onError Optional callback for when URL validation fails
 */
export const safelyOpenURL = (url: string, onError?: (message: string) => void): void => {
    if (!isValidMonitoringURL(url)) {
        const errorMessage = 'Cannot open URL: The monitoring link is not from a trusted source.';
        console.error(errorMessage, url);
        if (onError) {
            onError(errorMessage);
        }
        return;
    }
    
    window.open(url, '_blank', 'noopener,noreferrer');
};
