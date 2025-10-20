"use client"

export function LinkedInFeed() {
  return (
    <div className="flex justify-center w-full">
      <div className="linkedin-share-button max-w-2xl w-full">
        <iframe
          src="https://www.linkedin.com/company/embed/pawitsoftwaredevelopment/feed"
          height="600"
          width="100%"
          frameBorder="0"
          allowFullScreen={true}
          className="rounded-xl shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
        />
      </div>
    </div>
  )
}