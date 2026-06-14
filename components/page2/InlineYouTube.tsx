export default function InlineYouTube({
  videoId,
  title,
  start = 0,
}: {
  videoId: string;
  title: string;
  start?: number;
}) {
  const embed = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1${start ? `&start=${start}` : ""}`;
  return (
    <div
      style={{
        position: "relative",
        display: "block",
        aspectRatio: "16/9",
        border: "1px solid var(--line)",
        overflow: "hidden",
        background: "var(--bg-2)",
      }}
    >
      <iframe
        src={embed}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
      />
    </div>
  );
}
