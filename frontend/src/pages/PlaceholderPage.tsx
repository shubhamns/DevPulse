type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="glass-panel rounded-3xl p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-950">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{description}</p>
    </div>
  );
}
