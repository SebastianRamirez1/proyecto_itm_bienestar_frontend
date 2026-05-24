import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../api/client';
import { EP_HEALTH_SCHEDULE, EP_HEALTH_EMERGENCY, EP_HEALTH_APPOINTMENT, EP_HEALTH_APPOINTMENTS } from '../../../api/endpoints';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { toast } from 'sonner';
import { useApiError } from '../../../hooks/useApiError';
import { SkeletonCard, SkeletonList } from '../../../components/Skeleton';
import { ClipboardList } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Campus {
  name: string;
  address: string;
  hours: string;
}
interface ScheduleData {
  data: {
    serviceName: string;
    campuses: Campus[];
    virtualAttention: string;
    email: string;
  };
}
interface Contact {
  name: string;
  phone: string;
  available: string;
  type: 'hotline' | 'itm';
}
interface ContactsData {
  data: Contact[];
}

// ── Types ─────────────────────────────────────────────────────────────────────
type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled';

interface Appointment {
  id: string;
  preferredDate: string;
  reason: string;
  modality: 'presencial' | 'virtual';
  status: AppointmentStatus;
  createdAt: string;
}

// ── Appointment form ───────────────────────────────────────────────────────────
const apptSchema = z.object({
  preferredDate: z.string().min(1, 'Selecciona una fecha'),
  reason:        z.string().min(10, 'Describe brevemente el motivo (mín. 10 caracteres)'),
  modality:      z.enum(['presencial', 'virtual']),
});
type ApptForm = z.infer<typeof apptSchema>;

export default function HealthPage() {
  const { getErrorMessage } = useApiError();
  const qc = useQueryClient();
  const [submitting, setSubmitting] = useState(false);

  const { data: apptData, isLoading: apptLoading } = useQuery<{ success: boolean; data: Appointment[] }>({
    queryKey: ['my-appointments'],
    queryFn: () => apiClient.get(EP_HEALTH_APPOINTMENTS).then((r) => r.data),
    staleTime: 60_000,
  });

  const { data: scheduleData, isLoading: scheduleLoading } = useQuery<ScheduleData>({
    queryKey: ['health-schedule'],
    queryFn: () => apiClient.get(EP_HEALTH_SCHEDULE).then((r) => r.data),
    staleTime: 30 * 60_000,
  });

  const { data: contactsData, isLoading: contactsLoading } = useQuery<ContactsData>({
    queryKey: ['health-contacts'],
    queryFn: () => apiClient.get(EP_HEALTH_EMERGENCY).then((r) => r.data),
    staleTime: 30 * 60_000,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ApptForm>({
    resolver: zodResolver(apptSchema),
    defaultValues: { modality: 'presencial' },
  });

  const onSubmit = async (values: ApptForm) => {
    setSubmitting(true);
    try {
      await apiClient.post(EP_HEALTH_APPOINTMENT, values);
      toast.success('Solicitud enviada. El equipo de psicología te contactará en 24 h hábiles.');
      reset();
      qc.invalidateQueries({ queryKey: ['my-appointments'] });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const schedule = scheduleData?.data;
  const contacts = contactsData?.data ?? [];
  const hotlines = contacts.filter((c) => c.type === 'hotline');
  const itmContacts = contacts.filter((c) => c.type === 'itm');

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Salud y Bienestar</h1>
        <p className="text-gray-500 text-sm mt-1">Agenda una cita psicológica o consulta contactos de emergencia</p>
      </div>

      {/* Schedule */}
      {scheduleLoading && <SkeletonCard />}
      {schedule && (
        <section className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold text-gray-800 text-lg">{schedule.serviceName}</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {schedule.campuses.map((c) => (
              <div key={c.name} className="rounded-lg bg-primary-50 p-4">
                <p className="font-medium text-primary text-sm">{c.name}</p>
                <p className="text-xs text-gray-600 mt-0.5">{c.address}</p>
                <p className="text-xs text-gray-500 mt-1">{c.hours}</p>
              </div>
            ))}
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Atención virtual:</span> {schedule.virtualAttention}
            {' · '}
            <a href={`mailto:${schedule.email}`} className="text-primary hover:underline">{schedule.email}</a>
          </div>
        </section>
      )}

      {/* Appointment form */}
      <section className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-800 text-lg mb-4">Solicitar cita</h2>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha preferida</label>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${errors.preferredDate ? 'border-red-400' : 'border-gray-300'}`}
              {...register('preferredDate')}
            />
            {errors.preferredDate && <p className="mt-1 text-xs text-red-500">{errors.preferredDate.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo de consulta</label>
            <textarea
              rows={3}
              placeholder="Describe brevemente lo que te gustaría trabajar…"
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none ${errors.reason ? 'border-red-400' : 'border-gray-300'}`}
              {...register('reason')}
            />
            {errors.reason && <p className="mt-1 text-xs text-red-500">{errors.reason.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Modalidad</label>
            <div className="flex gap-4">
              {(['presencial', 'virtual'] as const).map((m) => (
                <label key={m} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" value={m} {...register('modality')} className="accent-primary" />
                  <span className="capitalize">{m}</span>
                </label>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-primary hover:bg-primary-light text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition disabled:opacity-60"
          >
            {submitting ? 'Enviando…' : 'Solicitar cita'}
          </button>
        </form>
      </section>

      {/* My appointments */}
      <section className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
          <ClipboardList size={20} className="text-primary" />
          Mis solicitudes de cita
        </h2>

        {apptLoading && <SkeletonList rows={3} />}

        {!apptLoading && (apptData?.data ?? []).length === 0 && (
          <p className="text-sm text-gray-400">No has solicitado citas aún.</p>
        )}

        {!apptLoading && (apptData?.data ?? []).length > 0 && (
          <div className="divide-y">
            {(apptData!.data).map((a) => (
              <div key={a.id} className="py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{a.reason}</p>
                  <p className="text-xs text-gray-400 mt-0.5 capitalize">
                    {new Date(a.preferredDate).toLocaleDateString('es-CO', {
                      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
                    })} · {a.modality}
                  </p>
                </div>
                <AppointmentStatusBadge status={a.status} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Emergency contacts */}
      <section className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="font-semibold text-gray-800 text-lg">Contactos de emergencia</h2>
        {contactsLoading && <SkeletonCard />}
        {!contactsLoading && contacts.length === 0 && (
          <p className="text-sm text-gray-400">No hay contactos de emergencia disponibles.</p>
        )}
        {hotlines.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Líneas nacionales</p>
            <div className="space-y-2">
              {hotlines.map((c) => (
                <ContactCard key={c.name} contact={c} />
              ))}
            </div>
          </div>
        )}
        {itmContacts.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Servicios ITM</p>
            <div className="space-y-2">
              {itmContacts.map((c) => (
                <ContactCard key={c.name} contact={c} />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  const cfg = {
    pending:   { label: 'Pendiente',  cls: 'bg-yellow-100 text-yellow-700' },
    confirmed: { label: 'Confirmada', cls: 'bg-green-100  text-green-700'  },
    cancelled: { label: 'Cancelada',  cls: 'bg-red-100    text-red-600'    },
  }[status] ?? { label: status, cls: 'bg-gray-100 text-gray-600' };

  return (
    <span className={`flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function ContactCard({ contact }: { contact: Contact }) {
  return (
    <div className="flex items-start justify-between rounded-lg bg-gray-50 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-gray-800">{contact.name}</p>
        <p className="text-xs text-gray-500">{contact.available}</p>
      </div>
      <a
        href={`tel:${contact.phone}`}
        className="text-primary font-semibold text-sm hover:underline"
      >
        {contact.phone}
      </a>
    </div>
  );
}
