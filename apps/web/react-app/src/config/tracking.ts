// Tracking scripts configuration
// To add your tracking codes, update the environment variables in .env file

export interface TrackingScript {
  id: string;
  name: string;
  enabled: boolean;
  script: string;
  position: 'head' | 'body';
}

// Get environment variables with fallbacks
const JOURNEY_SCRIPT_ID = process.env.REACT_APP_JOURNEY_SCRIPT_ID || '';
const GA_MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID || '';
const GOOGLE_SITE_VERIFICATION = process.env.REACT_APP_GOOGLE_SITE_VERIFICATION || '';
const FB_PIXEL_ID = process.env.REACT_APP_FB_PIXEL_ID || '';
const CUSTOM_HEAD_SCRIPTS = process.env.REACT_APP_CUSTOM_HEAD_SCRIPTS || '';
const CUSTOM_BODY_SCRIPTS = process.env.REACT_APP_CUSTOM_BODY_SCRIPTS || '';

// Journey.ai tracking configuration
const journeyScript = {
  id: 'journey-ai',
  name: 'Journey AI',
  enabled: !!JOURNEY_SCRIPT_ID,
  script: JOURNEY_SCRIPT_ID ? `
    <script>
      (function() {
        var script = document.createElement('script');
        script.src = 'https://cdn.journey.ai/journey.min.js';
        script.setAttribute('data-journey-id', '${JOURNEY_SCRIPT_ID}');
        script.async = true;
        document.head.appendChild(script);
      })();
    </script>
  ` : '',
  position: 'head' as const
};

// Google Analytics configuration
const googleAnalyticsScript = {
  id: 'google-analytics',
  name: 'Google Analytics',
  enabled: !!GA_MEASUREMENT_ID,
  script: GA_MEASUREMENT_ID ? `
    <script async src="https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_MEASUREMENT_ID}');
    </script>
  ` : '',
  position: 'head' as const
};

// Google Search Console verification
const googleSearchConsoleScript = {
  id: 'google-search-console',
  name: 'Google Search Console',
  enabled: !!GOOGLE_SITE_VERIFICATION,
  script: GOOGLE_SITE_VERIFICATION ? `
    <meta name="google-site-verification" content="${GOOGLE_SITE_VERIFICATION}" />
  ` : '',
  position: 'head' as const
};

// Facebook Pixel configuration
const facebookPixelScript = {
  id: 'facebook-pixel',
  name: 'Facebook Pixel',
  enabled: !!FB_PIXEL_ID,
  script: FB_PIXEL_ID ? `
    <script>
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${FB_PIXEL_ID}');
      fbq('track', 'PageView');
    </script>
    <noscript>
      <img height="1" width="1" style="display:none"
        src="https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1"/>
    </noscript>
  ` : '',
  position: 'body' as const
};

// Custom scripts configuration
const customHeadScript = {
  id: 'custom-head',
  name: 'Custom Head Scripts',
  enabled: !!CUSTOM_HEAD_SCRIPTS,
  script: CUSTOM_HEAD_SCRIPTS,
  position: 'head' as const
};

const customBodyScript = {
  id: 'custom-body',
  name: 'Custom Body Scripts',
  enabled: !!CUSTOM_BODY_SCRIPTS,
  script: CUSTOM_BODY_SCRIPTS,
  position: 'body' as const
};

// Export all tracking scripts
export const trackingScripts: TrackingScript[] = [
  journeyScript,
  googleAnalyticsScript,
  googleSearchConsoleScript,
  facebookPixelScript,
  customHeadScript,
  customBodyScript
].filter(script => script.enabled);

// Helper function to get scripts by position
export const getScriptsByPosition = (position: 'head' | 'body'): TrackingScript[] => {
  return trackingScripts.filter(script => script.position === position);
};