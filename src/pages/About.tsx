import { Clock, Flame, HeartHandshake, Leaf, Mail, MapPin, Phone } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { Button } from '../components/Button'
import { StatTile } from '../components/Cards'
import { Photo, Reveal, SectionHeading } from '../components/Display'
import { Field, FormMessage, Input, Select, Textarea } from '../components/Form'
import { PageHeader } from '../components/Layout'
import { ABOUT, SITE, STATS } from '../data'
import { postJson, useDocumentTitle } from '../lib/hooks'
import { validateContact, type FieldErrors } from '../shared/validation'

const VALUE_ICONS = [Leaf, Flame, HeartHandshake]

export function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', topic: '', message: '' })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [state, setState] = useState<{ loading?: boolean; error?: string; reference?: string }>({})
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const local = validateContact(form)
    setErrors(local)
    if (Object.keys(local).length) return setState({ error: 'Please check the highlighted fields.' })
    setState({ loading: true })
    const res = await postJson<{ reference: string }>('/api/contact', form)
    if (!res.ok) {
      setErrors(res.fieldErrors ?? {})
      return setState({ error: res.error })
    }
    setState({ reference: res.data.reference })
    setForm({ name: '', email: '', topic: '', message: '' })
  }

  if (state.reference)
    return (
      <div className="flex flex-col items-start gap-4">
        <FormMessage tone="success">
          Thanks, we have your message (reference {state.reference}). We reply within a working day.
        </FormMessage>
        <Button variant="outline" onClick={() => setState({})}>
          Send another message
        </Button>
      </div>
    )

  return (
    <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
      <Field label="Name" error={errors.name}>
        <Input autoComplete="name" value={form.name} onChange={set('name')} />
      </Field>
      <Field label="Email" error={errors.email}>
        <Input type="email" autoComplete="email" value={form.email} onChange={set('email')} />
      </Field>
      <Field label="Topic" error={errors.topic} className="sm:col-span-2">
        <Select value={form.topic} onChange={set('topic')}>
          <option value="">Choose a topic</option>
          {ABOUT.contactTopics.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </Select>
      </Field>
      <Field label="Message" error={errors.message} className="sm:col-span-2">
        <Textarea value={form.message} onChange={set('message')} rows={5} />
      </Field>
      {state.error && (
        <div className="sm:col-span-2">
          <FormMessage tone="error">{state.error}</FormMessage>
        </div>
      )}
      <div className="sm:col-span-2">
        <Button type="submit" variant="leaf" size="lg" loading={state.loading}>
          Send message
        </Button>
      </div>
    </form>
  )
}

export function About() {
  useDocumentTitle('About us')
  return (
    <>
      <PageHeader title={ABOUT.title} body={ABOUT.lead} />
      <section className="container-page grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
        <div className="flex flex-col gap-5 text-[17px] leading-relaxed text-muted">
          {ABOUT.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <div className="mt-4 grid grid-cols-2 gap-4">
            {STATS.map((s) => (
              <StatTile key={s.label} value={s.value} label={s.label} />
            ))}
          </div>
        </div>
        <div className="relative aspect-square overflow-hidden rounded-[var(--radius-xl)] bg-lime">
          <Photo name="pizzaBoard" className="absolute top-[4%] left-[2%] w-[74%]" />
          <Photo name="burger" className="absolute right-[2%] bottom-[4%] w-[44%] drop-shadow-[var(--shadow-food)]" alt="" />
          <Photo name="shake" className="absolute top-[4%] right-[6%] w-[22%]" alt="" />
        </div>
      </section>

      <section className="bg-card py-16 lg:py-20" aria-labelledby="values">
        <div className="container-page">
          <SectionHeading title={<span id="values">What we will not compromise on</span>} />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {ABOUT.values.map((v, i) => {
              const Icon = VALUE_ICONS[i]
              return (
                <Reveal key={v.title} delay={i * 0.06} className="flex flex-col gap-3 rounded-[var(--radius-md)] bg-white p-6 shadow-[var(--shadow-card)]">
                  <span className="round flex size-12 items-center justify-center rounded-full bg-forest text-sun">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="text-[19px] font-semibold">{v.title}</h3>
                  <p className="text-[15px] leading-relaxed text-muted">{v.body}</p>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      <section id="contact" className="container-page grid scroll-mt-24 gap-12 py-16 lg:grid-cols-[1fr_1.4fr] lg:py-24" aria-labelledby="contact-h">
        <div className="flex flex-col gap-6">
          <SectionHeading title={<span id="contact-h">Get in touch</span>} body="Questions about an order, catering for the office or a partnership idea. A real person reads every message." />
          <ul className="flex flex-col gap-4 text-[15px]">
            <li className="flex items-center gap-3">
              <MapPin className="mt-0.5 size-5 shrink-0 text-leaf" aria-hidden />
              {SITE.address}
            </li>
            <li className="flex items-center gap-3">
              <Phone className="mt-0.5 size-5 shrink-0 text-leaf" aria-hidden />
              <a href={SITE.phoneHref} className="inline-flex min-h-10 items-center hover:underline">
                {SITE.phone}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="mt-0.5 size-5 shrink-0 text-leaf" aria-hidden />
              <a href={`mailto:${SITE.email}`} className="inline-flex min-h-10 items-center hover:underline">
                {SITE.email}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Clock className="mt-0.5 size-5 shrink-0 text-leaf" aria-hidden />
              <dl className="grid grid-cols-[auto_auto] gap-x-4 gap-y-1">
                {SITE.hours.map((h) => (
                  <div key={h.days} className="contents">
                    <dt className="text-muted">{h.days}</dt>
                    <dd>{h.time}</dd>
                  </div>
                ))}
              </dl>
            </li>
          </ul>
        </div>
        <div className="rounded-[var(--radius-lg)] border p-6 md:p-8">
          <ContactForm />
        </div>
      </section>
    </>
  )
}
