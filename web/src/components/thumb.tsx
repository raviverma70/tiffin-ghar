export default function Thumb({
  src,
  alt,
  className = "",
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} loading="lazy" className={`object-cover ${className}`} />;
  }
  return (
    <div aria-hidden="true" className={`flex items-center justify-center bg-orange-100 text-3xl ${className}`}>
      🍱
    </div>
  );
}