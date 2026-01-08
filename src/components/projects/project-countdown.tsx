'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock } from 'lucide-react'

interface ProjectCountdownProps {
  endDate: string
  lang: 'es' | 'en'
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
  isExpired: boolean
}

export function ProjectCountdown({ endDate, lang }: ProjectCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const calculateTimeLeft = (): TimeLeft => {
      const difference = new Date(endDate).getTime() - new Date().getTime()

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true }
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isExpired: false,
      }
    }

    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [endDate, mounted])

  if (!mounted || !timeLeft) {
    return null
  }

  const formatNumber = (num: number) => String(num).padStart(2, '0')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5" />
          {lang === 'en' ? 'Project Countdown' : 'Cuenta Regresiva del Proyecto'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {timeLeft.isExpired ? (
          <div className="text-center py-6">
            <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-semibold text-muted-foreground">
              {lang === 'en' ? 'Delivery date has passed' : 'La fecha de entrega ha pasado'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-primary">
                {formatNumber(timeLeft.days)}
              </div>
              <div className="text-xs text-muted-foreground uppercase mt-1">
                {lang === 'en' ? 'Days' : 'Días'}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-primary">
                {formatNumber(timeLeft.hours)}
              </div>
              <div className="text-xs text-muted-foreground uppercase mt-1">
                {lang === 'en' ? 'Hours' : 'Horas'}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-primary">
                {formatNumber(timeLeft.minutes)}
              </div>
              <div className="text-xs text-muted-foreground uppercase mt-1">
                {lang === 'en' ? 'Minutes' : 'Minutos'}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-primary">
                {formatNumber(timeLeft.seconds)}
              </div>
              <div className="text-xs text-muted-foreground uppercase mt-1">
                {lang === 'en' ? 'Seconds' : 'Segundos'}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
