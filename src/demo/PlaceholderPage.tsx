interface PlaceholderPageProps {
  title: string
}

/** Содержимое страниц не является предметом задания — просто заглушка для демонстрации переходов. */
export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      <p className="mt-2 text-slate-500">Содержимое страницы «{title}» — демо-заглушка.</p>
    </div>
  )
}
