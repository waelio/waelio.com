export default defineNuxtPlugin((nuxtApp) => {
    const config = useRuntimeConfig()
    const id = config.public.googleAnalyticsId

    // Only run on client, when an ID is present, and in production builds
    if (!process.client || !id || !import.meta.env.PROD)
        return

    // Inject GA4 script
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`
    document.head.appendChild(script)

    // Initialize dataLayer/gtag
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error dataLayer is a global created by GA
    window.dataLayer = window.dataLayer || []
    // eslint-disable-next-line no-var
    // @ts-expect-error gtag is defined on window by GA snippet
    function gtag(...args: any[]) { (window as any).dataLayer.push(args) }
    // @ts-expect-error gtag is defined on window by GA snippet
    ; (window as any).gtag = gtag

    gtag('js', new Date())
    gtag('config', id, { send_page_view: false })

    // Send initial page view and track subsequent route changes
    const sendPageView = () => {
        try {
            const path = `${location.pathname}${location.search}${location.hash}`
            gtag('event', 'page_view', {
                page_path: path,
                page_location: location.href,
                page_title: document.title,
            })
        }
        catch (e) {
            // ignore
        }
    }

    // Initial page view
    if (document.readyState === 'complete')
        sendPageView()
    else
        window.addEventListener('load', sendPageView, { once: true })

    // Subsequent navigations
    nuxtApp.hook('page:finish', () => {
        sendPageView()
    })
})
