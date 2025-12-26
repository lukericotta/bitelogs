import helmet from 'helmet';
import { RequestHandler } from 'express';
import { config } from '../config';

// Configure helmet with appropriate settings
export const securityHeaders = (): RequestHandler => {
  return helmet({
    // Content Security Policy
    contentSecurityPolicy: config.NODE_ENV === 'production' ? {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'blob:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    } : false, // Disable CSP in development for easier debugging
    
    // Cross-Origin settings
    crossOriginEmbedderPolicy: false, // May need adjustment based on image hosting
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    
    // DNS Prefetch Control
    dnsPrefetchControl: { allow: false },
    
    // Frameguard - prevent clickjacking
    frameguard: { action: 'deny' },
    
    // Hide X-Powered-By header
    hidePoweredBy: true,
    
    // HSTS - only in production with HTTPS
    hsts: config.NODE_ENV === 'production' ? {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    } : false,
    
    // IE No Open
    ieNoOpen: true,
    
    // No Sniff - prevent MIME type sniffing
    noSniff: true,
    
    // Origin Agent Cluster
    originAgentCluster: true,
    
    // Permitted Cross-Domain Policies
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
    
    // Referrer Policy
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    
    // XSS Filter (legacy, but doesn't hurt)
    xssFilter: true,
  });
};

export default securityHeaders;
