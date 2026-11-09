export function SectionHeading({ id, kicker, title, action }: { id: string; kicker: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-teal-800">{kicker}</p>
        <h2 id={id} className="text-2xl font-extrabold sm:text-3xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}
