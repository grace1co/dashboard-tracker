'use client'

import { useState, useEffect, useCallback } from 'react'
import { Save, User, Bell, Palette, Phone, Calendar, Loader2, CheckCircle } from 'lucide-react'
import { Card, FormInput, FormSelect } from '@/components/ui'

interface Settings {
  userName: string
  phoneNumber: string | null
  morningTextTime: string
  eveningTextTime: string
  timezone: string
  weekStartsOn: number
  smsEnabled: boolean
  googleCalendarEnabled: boolean
  theme: string
}

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Australia/Sydney',
]

const THEMES = [
  { value: 'sage', label: '🌿 Sage Garden (default)' },
  { value: 'ocean', label: '🌊 Ocean Blue' },
  { value: 'rose', label: '🌸 Rose Petal' },
  { value: 'sunset', label: '🌅 Warm Sunset' },
  { value: 'forest', label: '🌲 Deep Forest' },
]

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    userName: 'Alex',
    phoneNumber: '',
    morningTextTime: '08:00',
    eveningTextTime: '21:00',
    timezone: 'America/New_York',
    weekStartsOn: 1,
    smsEnabled: false,
    googleCalendarEnabled: false,
    theme: 'sage',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings')
      if (res.ok) {
        const data = await res.json()
        setSettings((prev) => ({ ...prev, ...data }))
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } finally {
      setSaving(false)
    }
  }

  const update = (key: keyof Settings, value: unknown) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-sage-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-28 md:pb-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl md:text-3xl text-forest-900">Settings</h1>
        <p className="text-forest-500 mt-1">Personalize your dashboard experience</p>
      </div>

      {/* Profile */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-sage-100 flex items-center justify-center">
            <User className="w-5 h-5 text-sage-600" />
          </div>
          <h2 className="font-semibold text-forest-900">Profile</h2>
        </div>
        <FormInput
          label="Your name"
          value={settings.userName}
          onChange={(value) => update('userName', value)}
          placeholder="Alex"
        />
        <p className="text-sm text-forest-400 -mt-2">
          Used in greetings and the morning text message.
        </p>
      </Card>

      {/* Appearance */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-lavender-100 flex items-center justify-center">
            <Palette className="w-5 h-5 text-lavender-600" />
          </div>
          <h2 className="font-semibold text-forest-900">Appearance</h2>
        </div>
        <FormSelect
          label="Color theme"
          value={settings.theme}
          onChange={(value) => update('theme', value)}
          options={THEMES}
        />
        <p className="text-sm text-forest-400 -mt-2">Theme switching — full implementation coming soon.</p>

        <div className="mt-4">
          <FormSelect
            label="Week starts on"
            value={settings.weekStartsOn.toString()}
            onChange={(value) => update('weekStartsOn', parseInt(value))}
            options={[
              { value: '0', label: 'Sunday' },
              { value: '1', label: 'Monday' },
            ]}
          />
        </div>
      </Card>

      {/* Time & Timezone */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-terracotta-100 flex items-center justify-center">
            <Bell className="w-5 h-5 text-terracotta-500" />
          </div>
          <h2 className="font-semibold text-forest-900">Notifications & Time</h2>
        </div>
        <FormSelect
          label="Timezone"
          value={settings.timezone}
          onChange={(value) => update('timezone', value)}
          options={TIMEZONES.map((tz) => ({ value: tz, label: tz.replace('_', ' ') }))}
        />
        <div className="grid grid-cols-2 gap-4 mt-4">
          <FormInput
            label="Morning text time"
            type="time"
            value={settings.morningTextTime}
            onChange={(value) => update('morningTextTime', value)}
          />
          <FormInput
            label="Evening check-in time"
            type="time"
            value={settings.eveningTextTime}
            onChange={(value) => update('eveningTextTime', value)}
          />
        </div>
      </Card>

      {/* SMS */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-sage-100 flex items-center justify-center">
            <Phone className="w-5 h-5 text-sage-600" />
          </div>
          <h2 className="font-semibold text-forest-900">SMS Automation</h2>
        </div>

        <label className="flex items-center justify-between py-3 border-b border-cream cursor-pointer">
          <span className="text-forest-700">Enable SMS texts</span>
          <button
            onClick={() => update('smsEnabled', !settings.smsEnabled)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              settings.smsEnabled ? 'bg-sage-500' : 'bg-forest-200'
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                settings.smsEnabled ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </label>

        <div className="mt-4">
          <FormInput
            label="Your phone number (E.164 format)"
            value={settings.phoneNumber ?? ''}
            onChange={(value) => update('phoneNumber', value)}
            placeholder="+12125551234"
          />
        </div>

        <div className="mt-3 p-3 bg-cream rounded-lg text-sm text-forest-600">
          <p className="font-medium mb-1">Setup required:</p>
          <ol className="list-decimal list-inside space-y-1 text-forest-500">
            <li>Create a <a href="https://twilio.com" className="text-sage-600 underline" target="_blank" rel="noreferrer">Twilio</a> account</li>
            <li>Get a phone number and note your Account SID + Auth Token</li>
            <li>Add <code className="bg-white px-1 rounded">TWILIO_ACCOUNT_SID</code>, <code className="bg-white px-1 rounded">TWILIO_AUTH_TOKEN</code>, <code className="bg-white px-1 rounded">TWILIO_PHONE_NUMBER</code> to your <code className="bg-white px-1 rounded">.env.local</code></li>
            <li>Point your Twilio webhook to <code className="bg-white px-1 rounded">/api/sms/receive</code></li>
          </ol>
        </div>
      </Card>

      {/* Google Calendar */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-lavender-100 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-lavender-600" />
          </div>
          <h2 className="font-semibold text-forest-900">Google Calendar</h2>
        </div>

        <label className="flex items-center justify-between py-3 border-b border-cream cursor-pointer">
          <span className="text-forest-700">Sync Google Calendar</span>
          <button
            onClick={() => update('googleCalendarEnabled', !settings.googleCalendarEnabled)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              settings.googleCalendarEnabled ? 'bg-sage-500' : 'bg-forest-200'
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                settings.googleCalendarEnabled ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </label>

        <div className="mt-3 p-3 bg-cream rounded-lg text-sm text-forest-600">
          <p className="font-medium mb-1">Setup required:</p>
          <ol className="list-decimal list-inside space-y-1 text-forest-500">
            <li>Go to <a href="https://console.cloud.google.com" className="text-sage-600 underline" target="_blank" rel="noreferrer">Google Cloud Console</a></li>
            <li>Create a project and enable the Google Calendar API</li>
            <li>Create OAuth 2.0 credentials</li>
            <li>Add <code className="bg-white px-1 rounded">GOOGLE_CLIENT_ID</code>, <code className="bg-white px-1 rounded">GOOGLE_CLIENT_SECRET</code>, <code className="bg-white px-1 rounded">GOOGLE_REFRESH_TOKEN</code> to your <code className="bg-white px-1 rounded">.env.local</code></li>
          </ol>
        </div>
      </Card>

      {/* PWA Info */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="text-2xl">📱</div>
          <div>
            <h2 className="font-semibold text-forest-900">Install as App</h2>
            <p className="text-sm text-forest-500">Add to your phone's home screen</p>
          </div>
        </div>
        <div className="space-y-3 text-sm text-forest-600">
          <div className="p-3 bg-cream rounded-lg">
            <p className="font-medium text-forest-800 mb-1">🍎 iPhone (Safari)</p>
            <p>Tap the Share button → scroll down → tap <strong>"Add to Home Screen"</strong> → tap Add</p>
          </div>
          <div className="p-3 bg-cream rounded-lg">
            <p className="font-medium text-forest-800 mb-1">🤖 Android (Chrome)</p>
            <p>Tap the menu (⋮) → tap <strong>"Add to Home Screen"</strong> or <strong>"Install App"</strong> → tap Add</p>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="sticky bottom-20 md:bottom-0 pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-4 bg-sage-500 hover:bg-sage-600 active:scale-95 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-60"
        >
          {saving ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Saving…</>
          ) : saved ? (
            <><CheckCircle className="w-5 h-5" /> Saved!</>
          ) : (
            <><Save className="w-5 h-5" /> Save Settings</>
          )}
        </button>
      </div>
    </div>
  )
}
