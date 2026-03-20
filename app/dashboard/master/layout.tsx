import SegmaxShell from "@/components/segmaxshell"

export default function MasterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SegmaxShell role="master">{children}</SegmaxShell>
}