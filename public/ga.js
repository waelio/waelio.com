(function(){
  function getGAId(){
    var meta = document.querySelector('meta[name="ga-id"]');
    if(meta && meta.content && meta.content.trim()) return meta.content.trim();
    return '';
  }
  var GA_ID = getGAId();
  if(!GA_ID) return; // no-op if not set

  var gtagScript = document.createElement('script');
  gtagScript.async = true;
  gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
  document.head.appendChild(gtagScript);

  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_ID, { anonymize_ip: true });
})();
