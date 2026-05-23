import { useAuth } from '../../../hooks/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Hola, {user?.name?.split(' ')[0]} 👋
      </h1>
      <p className="text-gray-500 text-sm mb-8">
        Bienvenido al portal de Bienestar Universitario ITM
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Salud mental', desc: 'Agenda citas y accede a recursos de salud', href: '/health', color: 'bg-blue-50 border-blue-200' },
          { label: 'Recursos', desc: 'Material de apoyo académico y emocional', href: '/resources', color: 'bg-green-50 border-green-200' },
          { label: 'Eventos', desc: 'Talleres, charlas y actividades de bienestar', href: '/events', color: 'bg-purple-50 border-purple-200' },
        ].map((card) => (
          <a
            key={card.href}
            href={card.href}
            className={`block rounded-xl border p-5 transition hover:shadow-md ${card.color}`}
          >
            <h2 className="font-semibold text-gray-800">{card.label}</h2>
            <p className="text-sm text-gray-500 mt-1">{card.desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
