import { ReactNode } from "react"
import SegmaxSidebar, { SegmaxRole } from "./segmaxsidebar"

type SegmaxShellProps = {
  children: ReactNode
  role: SegmaxRole | string
  profileName?: string
  name?: string
  profileLabel?: string
  label?: string
  title?: string
  subtitle?: string
  actions?: ReactNode
  className?: string
}

export default function SegmaxShell({
  children,
  role,
  profileName,
  name,
  profileLabel,
  label,
  title,
  subtitle,
  actions,
  className,
}: SegmaxShellProps) {
  const displayName = profileName || name || "Usuário"
  const displayLabel = profileLabel || label

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto flex min-h-screen w-full">
        <SegmaxSidebar
          role={role}
          profileName={displayName}
          profileLabel={displayLabel}
        />

        <main className={["min-w-0 flex-1 bg-black", className || ""].join(" ").trim()}>
          {(title || subtitle || actions) && (
            <div className="border-b border-zinc-900 px-8 py-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  {title ? (
                    <h1 className="text-3xl font-bold text-white">{title}</h1>
                  ) : null}

                  {subtitle ? (
                    <p className="mt-3 max-w-4xl text-base leading-7 text-zinc-400">
                      {subtitle}
                    </p>
                  ) : null}
                </div>

                {actions ? <div className="shrink-0">{actions}</div> : null}
              </div>
            </div>
          )}

          <div className="px-8 py-8">{children}</div>
        </main>
      </div>
    </div>
  )
}