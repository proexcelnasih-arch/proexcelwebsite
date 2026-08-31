"use client"

import { Dialog } from "@/components/ui/Dialog"

interface ProductVideoModalProps {
  open: boolean
  onClose: () => void
  videoUrl: string
  productName: string
}

export function ProductVideoModal({ open, onClose, videoUrl, productName }: ProductVideoModalProps) {
  if (!videoUrl) return null

  // Format embed if youtube or vimeo
  let embedUrl = videoUrl
  if (videoUrl.includes("youtube.com/watch?v=")) {
    const videoId = videoUrl.split("v=")[1]?.split("&")[0]
    embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`
  } else if (videoUrl.includes("youtu.be/")) {
    const videoId = videoUrl.split("youtu.be/")[1]?.split("?")[0]
    embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`
  } else if (videoUrl.includes("vimeo.com/")) {
    const videoId = videoUrl.split("vimeo.com/")[1]?.split("?")[0]
    embedUrl = `https://player.vimeo.com/video/${videoId}?autoplay=1`
  }

  const isEmbed = embedUrl.includes("youtube.com") || embedUrl.includes("vimeo.com")

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Présentation vidéo — ${productName}`}
      size="lg"
    >
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 shadow-inner">
        {isEmbed ? (
          <iframe
            src={embedUrl}
            title={productName}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        ) : (
          <video
            src={embedUrl}
            controls
            autoPlay
            className="w-full h-full object-contain"
          >
            Votre navigateur ne supporte pas la lecture de vidéos.
          </video>
        )}
      </div>
    </Dialog>
  )
}
