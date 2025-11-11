export default defineNuxtPlugin((nuxtApp) => {
    const config = useRuntimeConfig()
    const id = config.public.googleAnalyticsId

    if (!process.client || !id || !import.meta.env.PROD)
        return

    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`
    document.head.appendChild(script)

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error dataLayer is a global created by GA
    window.dataLayer = window.dataLayer || []
    // @ts-expect-error gtag is defined by GA snippet
    function gtag(...args: any[]) { (window as any).dataLayer.push(args) }
    // @ts-expect-error gtag is defined by GA snippet
    ; (window as any).gtag = gtag

    gtag('js', new Date())
    gtag('config', id, { send_page_view: false })

    const sendPageView = () => {
        try {
            const path = `${location.pathname}${location.search}${location.hash}`
            gtag('event', 'page_view', {
                page_path: path,
                page_location: location.href,
                page_title: document.title,
            })
        }
        catch { }
    }

    if (document.readyState === 'complete')
        sendPageView()
    else
        window.addEventListener('load', sendPageView, { once: true })

    nuxtApp.hook('page:finish', () => sendPageView())
})
