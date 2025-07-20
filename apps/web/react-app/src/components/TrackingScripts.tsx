import { useEffect } from 'react';
import { getScriptsByPosition } from '../config/tracking';

export const TrackingScripts: React.FC = () => {
  useEffect(() => {
    // Inject head scripts
    const headScripts = getScriptsByPosition('head');
    headScripts.forEach(({ script, id }) => {
      if (script && !document.getElementById(`tracking-${id}`)) {
        const div = document.createElement('div');
        div.id = `tracking-${id}`;
        div.innerHTML = script;
        
        // Move script tags to head
        const scripts = div.getElementsByTagName('script');
        const metas = div.getElementsByTagName('meta');
        
        Array.from(scripts).forEach(scriptTag => {
          const newScript = document.createElement('script');
          Array.from(scriptTag.attributes).forEach(attr => {
            newScript.setAttribute(attr.name, attr.value);
          });
          if (scriptTag.innerHTML) {
            newScript.innerHTML = scriptTag.innerHTML;
          }
          document.head.appendChild(newScript);
        });
        
        Array.from(metas).forEach(metaTag => {
          document.head.appendChild(metaTag.cloneNode(true));
        });
      }
    });

    // Inject body scripts
    const bodyScripts = getScriptsByPosition('body');
    bodyScripts.forEach(({ script, id }) => {
      if (script && !document.getElementById(`tracking-body-${id}`)) {
        const div = document.createElement('div');
        div.id = `tracking-body-${id}`;
        div.innerHTML = script;
        document.body.appendChild(div);
      }
    });
  }, []);

  return null;
};