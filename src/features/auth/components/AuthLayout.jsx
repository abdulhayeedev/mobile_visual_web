import { Link } from 'react-router-dom'

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="flex min-h-dvh flex-col bg-slate-50">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="mb-8 flex justify-center gap-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white shadow-sm">
              H
            </div>
            <div className="text-left">
              <p className="text-base font-semibold text-slate-900">HAYEE</p>
              <p className="text-xs text-slate-500">
                University FYP · AV analytics
              </p>
            </div>
          </div>
          <div className="rounded-2xl bg-white px-6 py-8 shadow-sm ring-1 ring-slate-200/80 sm:px-10">
            <h1 className="text-center text-xl font-semibold text-slate-900">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-2 text-center text-sm text-slate-600">
                {subtitle}
              </p>
            ) : null}
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
